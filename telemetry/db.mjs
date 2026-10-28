/**
 * RAUVIAWEB shared telemetry MySQL adapter (Erika/Allison contract).
 * DB connection is server-side. No CREATE/ALTER/migrations.
 */
const TABLES = Object.freeze({
  visitors: ["site_id","visitor_id","first_seen_at","last_seen_at"],
  sessions: ["site_id","session_id","visitor_id","started_at","last_activity_at","landing_page","exit_page","referrer","utm_source","utm_medium","utm_campaign","device_type"],
  web_events: ["site_id","visitor_id","session_id","event_name","event_timestamp","properties"],
  ai_crawler_visits: ["site_id","crawler_name","crawler_family","user_agent","request_path","request_method","status_code","referer","requested_at","response_time_ms","ip_hash","properties"]
});
export const SITE_ID = "monica-garcia";
export const SITE_HOST = "monicagarcia.rauviaweb.mx";
export const DATABASE_NAME = "u345974778_rauviaplatform";
export const TABLE_NAMES = Object.keys(TABLES);

export function validateSchema(metadata) {
  for (const [table, required] of Object.entries(TABLES)) {
    const tableInfo = metadata?.[table];
    if (!tableInfo) throw new Error("schema_mismatch: " + table);
    const fields = tableInfo.columns.map(c => c.Field);
    if (required.some(name => !fields.includes(name))) throw new Error("schema_mismatch: " + table);
    if (tableInfo.columns.some(c =>
      !required.includes(c.Field) &&
      c.Null === "NO" && c.Default === null &&
      !/auto_increment|GENERATED/i.test(String(c.Extra))
    )) throw new Error("schema_additional_required_column: " + table);
  }
  for (const [table, id] of [["visitors","visitor_id"],["sessions","session_id"]]) {
    const groups = new Map();
    for (const row of metadata[table].indexes) {
      if (Number(row.Non_unique) !== 0) continue;
      const columns = groups.get(row.Key_name) || [];
      columns.push(row.Column_name);
      groups.set(row.Key_name, columns);
    }
    if (![...groups.values()].some(columns => columns.length === 2 && columns.includes("site_id") && columns.includes(id))) {
      throw new Error("missing_site_scoped_unique_index: " + table);
    }
    if ([...groups.values()].some(columns => columns.includes(id) && !columns.includes("site_id"))) {
      throw new Error("unsafe_global_unique_index: " + table);
    }
  }
  const ipHash = metadata.ai_crawler_visits.columns.find(c => c.Field === "ip_hash");
  if (ipHash.Null !== "YES") throw new Error("privacy_schema_mismatch: ip_hash must allow NULL");
}

export function createTelemetryDb({ env = process.env, mysqlLoader = () => import("mysql2/promise") } = {}) {
  const enabled = ["1","true"].includes(String(env.TELEMETRY_ENABLED || "").toLowerCase());
  if (env.TELEMETRY_SITE_ID && env.TELEMETRY_SITE_ID !== SITE_ID) throw new Error("site_id_mismatch");
  if (env.TELEMETRY_SITE_HOST && env.TELEMETRY_SITE_HOST !== SITE_HOST) throw new Error("site_host_mismatch");
  if (env.DB_NAME && env.DB_NAME !== DATABASE_NAME) throw new Error("database_name_mismatch");
  const hasCredentials = Boolean(env.DB_HOST && env.DB_USER && env.DB_PASSWORD && env.DB_NAME === DATABASE_NAME);
  if (enabled && !hasCredentials) throw new Error("telemetry_enabled_without_database_credentials");
  let pool;
  let schemaReady = false;
  let inFlight;
  let retryAfter = 0;
  const state = { enabled, configured: hasCredentials, connected: false, schemaVerified: false, writes: 0, lastError: null };

  async function getPool() {
    if (!enabled) return null;
    if (!pool) {
      const mysql = await mysqlLoader();
      const createPool = mysql.createPool || mysql.default?.createPool;
      pool = createPool({
        host: env.DB_HOST, port: Number(env.DB_PORT || 3306),
        user: env.DB_USER, password: env.DB_PASSWORD, database: DATABASE_NAME,
        connectionLimit: 3, maxIdle: 3, waitForConnections: true, queueLimit: 20,
        connectTimeout: 3500
      });
    }
    return pool;
  }
  async function requireSchema() {
    if (Date.now() < retryAfter) throw new Error("db_backoff");
    const p = await getPool();
    if (!p) return null;
    if (schemaReady) return p;
    if (!inFlight) {
      inFlight = (async () => {
        const metadata = {};
        for (const table of TABLE_NAMES) {
          // Only constant code-defined names, never caller input.
          const [columns] = await p.query("SHOW COLUMNS FROM " + table);
          const [indexes] = await p.query("SHOW INDEX FROM " + table);
          metadata[table] = { columns, indexes };
        }
        validateSchema(metadata);
        schemaReady = true;
        state.schemaVerified = true;
        state.connected = true;
      })().catch(err => {
        state.connected = false;
        state.lastError = "database_or_schema_unavailable";
        retryAfter = Date.now() + 30000;
        throw err;
      }).finally(() => { inFlight = null; });
    }
    await inFlight;
    return p;
  }
  async function writeHuman({ visitorId, sessionId, path, event, deviceType, properties }) {
    const p = await requireSchema();
    if (!p) return false;
    try {
      await p.execute({
        sql: "INSERT INTO visitors (site_id, visitor_id, first_seen_at, last_seen_at) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE last_seen_at=NOW()", timeout: 3500
      }, [SITE_ID, visitorId]);
      await p.execute({
        sql: "INSERT INTO sessions (site_id, session_id, visitor_id, started_at, last_activity_at, landing_page, exit_page, referrer, utm_source, utm_medium, utm_campaign, device_type) VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE last_activity_at=NOW(), exit_page=VALUES(exit_page)", timeout: 3500
      }, [SITE_ID, sessionId, visitorId, path, path, null, null, null, null, deviceType]);
      await p.execute({
        sql: "INSERT INTO web_events (site_id, visitor_id, session_id, event_name, event_timestamp, properties) VALUES (?, ?, ?, ?, NOW(), ?)", timeout: 3500
      }, [SITE_ID, visitorId, sessionId, event, JSON.stringify(properties)]);
      state.writes++;
      state.connected = true;
      return true;
    } catch (e) {
      state.lastError = "database_write_unavailable"; state.connected = false;
      throw e;
    }
  }
  async function writeCrawler({ name, family, path, method, status, duration, properties }) {
    const p = await requireSchema();
    if (!p) return false;
    await p.execute({
      sql: "INSERT INTO ai_crawler_visits (site_id, crawler_name, crawler_family, user_agent, request_path, request_method, status_code, referer, requested_at, response_time_ms, ip_hash, properties) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)", timeout: 3500
    }, [
      SITE_ID, name, family, name, path, method, status, null,
      Math.min(Math.max(duration,0),30000), null, JSON.stringify(properties)
    ]);
    state.writes++;
    state.connected = true;
    return true;
  }
  async function check() {
    try { await requireSchema(); return { ...state }; }
    catch { return { ...state }; }
  }
  async function close() { if (pool) await pool.end(); }
  return { enabled, state, check, writeHuman, writeCrawler, close };
}
