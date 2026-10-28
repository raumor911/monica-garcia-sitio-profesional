#!/usr/bin/env node
/**
 * TEKTARYON v0.1.0 — TEK-03 Visual QA, RAUVIAWEB Profesional.
 * Baseline: current checkout; does NOT modify site or deploy.
 * Screenshots, measurements, screenshots of the mobile navigation,
 * and a machine-readable QA Evidence Ledger are produced in qa/visual-results/.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

const base = process.env.VISUAL_QA_BASE_URL || "http://127.0.0.1:4173";
const outDir = process.env.VISUAL_QA_OUTPUT_DIR || "qa/visual-results";
const sizes = [
  { width: 360, height: 844 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
];
const routes = [
  { id: "inicio", pathname: "/" },
  { id: "como-puedo-ayudarte", pathname: "/como-puedo-ayudarte/" },
  { id: "perspectiva", pathname: "/perspectiva/" }
];
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const now = new Date().toISOString();
const ledger = {
  schema_version: "TEKTARYON-QA-VISUAL-0.1.0",
  run_id: "TK-MONICA-G3-" + (process.env.GITHUB_RUN_ID || Date.now()),
  date_utc: now,
  timezone: "America/Mexico_City",
  site_id: "monica-garcia",
  vertical: "professional",
  source_repository: process.env.GITHUB_REPOSITORY || "raumor911/monica-garcia-sitio-profesional",
  commit_sha: process.env.GITHUB_SHA || null,
  environment: "GitHub Actions Ubuntu, Playwright Chromium headless, static localhost preview",
  base_url: base,
  status: "QA_REVIEW",
  gates: { G0: "pass_by_user", G1: "pass_by_user", G2: "in_progress", G3: "pending", G4: "not_requested" },
  viewports: sizes,
  pages: routes,
  tests: [],
  defects: [],
  limitations: [
    "Automated geometry diagnostics do not prove 100% visual equivalence to the approved mockup.",
    "Screenshots must be compared manually to approved reference images.",
    "Local preview is not production; SSL, DNS and real-world WhatsApp app handoff are not validated.",
    "Playwright screenshots do not establish real-user loading speed, search indexing or privacy compliance."
  ]
};
let testId = 0, defectId = 0;
function recordTest(route, width, expected, actual, status, evidence, severity = "P2") {
  const id = "QA-VIS-" + String(++testId).padStart(3, "0");
  const obj = { id, route, viewport_width: width, expected, actual, status, evidence, severity };
  ledger.tests.push(obj);
  if (status === "fail") {
    ledger.defects.push({
      id: "DEF-" + String(++defectId).padStart(3, "0"),
      test_id: id, severity, route, viewport_width: width,
      expected, observed: actual, evidence, reproduction: "Open " + base + route + " at width " + width + " px and inspect " + (evidence || "the page") + ".",
      owner: "RAUVIAWEB", status: "open"
    });
  }
}
const waitForServer = async () => {
  for (let n = 0; n < 30; n++) {
    try { const r = await fetch(base); if (r.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  throw new Error("Static preview is not available: " + base);
};
await waitForServer();
try {
  for (const s of sizes) {
    const context = await browser.newContext({
      viewport: { width: s.width, height: s.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      locale: "es-MX",
      colorScheme: "light"
    });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      const badResponses = [];
      const failedRequests = [];
      page.on("pageerror", err => errors.push(String(err.message)));
      page.on("console", msg => { if (msg.type() === "error") errors.push("console: " + msg.text()); });
      page.on("response", resp => { if (resp.status() >= 400) badResponses.push({ url: resp.url(), status: resp.status() }); });
      page.on("requestfailed", req => failedRequests.push({ url: req.url(), reason: req.failure()?.errorText || "unknown" }));
      let response;
      try {
        response = await page.goto(base + route.pathname, { waitUntil: "domcontentloaded", timeout: 25000 });
        await page.evaluate(async () => {
          await document.fonts.ready;
          // A full-page screenshot alone does NOT trigger below-the-fold lazy images.
          // Scroll like a real reader and request decoding before measuring loaded assets.
          for (const image of document.images) image.loading = "eager";
          const step = Math.max(450, Math.floor(window.innerHeight * 0.8));
          for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 65));
          }
          window.scrollTo(0, 0);
          const ready = Promise.all([...document.images].map(img => img.decode().catch(() => null)));
          await Promise.race([ready, new Promise(resolve => setTimeout(resolve, 5000))]);
        });
        await page.waitForTimeout(350);
      } catch (e) {
        recordTest(route.pathname, s.width, "Route renders", String(e), "fail", null, "P0");
        await page.close();
        continue;
      }
      const name = s.width + "px-" + route.id + ".png";
      const file = join(outDir, name);
      await page.screenshot({ path: file, fullPage: true, animations: "disabled", timeout: 45000 });
      const info = await page.evaluate(() => {
        const W = window.innerWidth;
        const D = document.documentElement;
        const isShown = (e) => {
          const style = getComputedStyle(e), r = e.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && r.width > 1 && r.height > 1;
        };
        const possibleOverflow = [...document.querySelectorAll("body *")].filter(isShown).map(e => {
          const r = e.getBoundingClientRect();
          return {
            tag: e.tagName.toLowerCase(),
            className: String(e.className?.baseVal ?? e.className ?? "").slice(0, 75),
            right: Math.round(r.right),
            left: Math.round(r.left),
            text: e.textContent?.trim().replace(/\s+/g, " ").slice(0, 75) || ""
          };
        }).filter(x => x.right > W + 3 || x.left < -3).slice(0, 15);
        const clippedTexts = [...document.querySelectorAll("h1,h2,h3,p,span,li,a,dt,dd,strong,small")].filter(isShown).filter(e => {
          const st = getComputedStyle(e);
          return e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 3 && !["visible", "clip"].includes(st.overflowX) && !!e.textContent?.trim();
        }).map(e => ({ text: e.textContent.trim().replace(/\s+/g, " ").slice(0, 70), className: String(e.className ?? "").slice(0, 65) })).slice(0, 15);
        const groups = [".metric", ".career-card", ".value-card", ".brand-tool", ".language-item", ".content-grid article", ".story-stack>div"];
        const overlaps = [];
        for (const selector of groups) {
          const elems = [...document.querySelectorAll(selector)].filter(isShown);
          for (let i = 0; i < elems.length; i++) {
            for (let j = i + 1; j < elems.length; j++) {
              const a = elems[i].getBoundingClientRect(), b = elems[j].getBoundingClientRect();
              const x = Math.min(a.right,b.right) - Math.max(a.left,b.left);
              const y = Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top);
              if (x > 4 && y > 4) overlaps.push({ selector, i, j, overlap_width: Math.round(x), overlap_height: Math.round(y) });
            }
          }
        }
        const images = [...document.images].map(i => ({ src: i.currentSrc || i.src, alt: i.alt, complete: i.complete, naturalWidth: i.naturalWidth })).filter(i => !i.complete || i.naturalWidth === 0);
        const btn = document.querySelector(".hero-whatsapp");
        const otherCvButtons = [...document.querySelectorAll("a")].filter(a => /ver (mi )?cv|solicitar (mi )?cv/i.test(a.textContent || "")).map(a => a.getAttribute("href"));
        const nav = document.querySelector(".primary-nav");
        return {
          viewport: W,
          document_scroll_width: D.scrollWidth,
          body_scroll_width: document.body.scrollWidth,
          height: D.scrollHeight,
          overflow_px: Math.max(D.scrollWidth, document.body.scrollWidth) - W,
          possible_overflow_elements: possibleOverflow,
          clipped_texts: clippedTexts,
          overlapping_card_pairs: overlaps,
          broken_images: images,
          headings: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()),
          hero_whatsapp_href: btn?.getAttribute("href") || null,
          cv_links_visible_on_page: otherCvButtons,
          nav_exists: !!nav,
          has_main: !!document.querySelector("main")
        };
      });
      const screenshotRef = name;
      const responsiveOk = info.overflow_px <= 2;
      recordTest(route.pathname, s.width, "No horizontal document overflow", "overflow_px=" + info.overflow_px + "; suspects=" + JSON.stringify(info.possible_overflow_elements.slice(0, 5)), responsiveOk ? "pass" : "fail", screenshotRef, "P1");
      recordTest(route.pathname, s.width, "No overlapping content cards", JSON.stringify(info.overlapping_card_pairs.slice(0, 6)), info.overlapping_card_pairs.length ? "fail" : "pass", screenshotRef, "P1");
      recordTest(route.pathname, s.width, "All images load", JSON.stringify(info.broken_images.slice(0, 7)), info.broken_images.length ? "fail" : "pass", screenshotRef, "P1");
      recordTest(route.pathname, s.width, "No clipped text", JSON.stringify(info.clipped_texts.slice(0, 7)), info.clipped_texts.length ? "fail" : "pass", screenshotRef, "P1");
      recordTest(route.pathname, s.width, "No browser JavaScript errors", JSON.stringify(errors.slice(0, 8)), errors.length ? "fail" : "pass", screenshotRef, "P1");
      recordTest(route.pathname, s.width, "Correct route and semantic H1", "HTTP=" + response?.status() + "; H1=" + JSON.stringify(info.headings),
        response?.status() === 200 && info.headings.length === 1 && info.has_main ? "pass" : "fail", screenshotRef, "P1");
      if (route.pathname === "/") {
        recordTest("/", s.width, "WA CTA points to approved number 525569143748", info.hero_whatsapp_href,
          info.hero_whatsapp_href?.includes("wa.me/525569143748") ? "pass" : "fail", screenshotRef, "P0");
      }
      if (badResponses.length || failedRequests.length) {
        recordTest(route.pathname,s.width,"No failed network requests",
          JSON.stringify({ badResponses: badResponses.slice(0, 4), failedRequests: failedRequests.slice(0, 4) }),
          "fail",screenshotRef,"P2");
      }
      // Human-led mockup comparison remains explicitly pending, not a synthetic PASS.
      recordTest(route.pathname,s.width,"Visual match with approved mockup; text legibility and alignment",
        "Screenshot recorded for manual comparison: " + screenshotRef,
        "pending",screenshotRef,"P1");
      if (route.pathname === "/" && s.width <= 390) {
        const mobileMenu = page.locator(".menu-toggle");
        if (await mobileMenu.count()) {
          await mobileMenu.click();
          await page.waitForTimeout(200);
          await page.screenshot({ path: join(outDir, s.width + "px-menu-abierto.png"), fullPage: false, animations: "disabled" });
          const state = await page.locator(".menu-toggle").getAttribute("aria-expanded");
          const navVisible = await page.locator("#primary-nav").isVisible();
          recordTest("/",s.width,"Mobile menu opens with accessible expanded state",
            "expanded=" + state + "; visible=" + navVisible, state === "true" && navVisible ? "pass" : "fail",
            s.width + "px-menu-abierto.png","P1");
        }
      }
      console.log(JSON.stringify({
        page: route.pathname, viewport: s.width, screenshot: screenshotRef,
        overflow_px: info.overflow_px, overlapping_cards: info.overlapping_card_pairs.length,
        clipped_texts: info.clipped_texts, broken_images: info.broken_images,
        page_errors: errors, network_failures: [...badResponses, ...failedRequests].slice(0, 4)
      }));
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const counts = ledger.tests.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});
ledger.summary = { total: ledger.tests.length, ...counts, defects: ledger.defects.length, screenshots: sizes.length * routes.length + 2 };
const critical = ledger.defects.filter(x => x.severity === "P0" || x.severity === "P1");
ledger.gates.G3 = critical.length ? "fail" : "pending"; // Pending until human-reviewed mockup comparison.
await writeFile(join(outDir, "qa-evidence-ledger.json"), JSON.stringify(ledger, null, 2) + "\n");
const markdown = [
  "# TEKTARYON — G3 Visual QA",
  "", "Fecha UTC: " + now, "Commit: " + ledger.commit_sha, "Entorno: " + ledger.environment,
  "", "Viewports: " + sizes.map(x => x.width).join(", "),
  "Páginas: " + routes.map(x => x.pathname).join(", "),
  "", "## Resultado automático",
  "- Pruebas: " + ledger.summary.total,
  "- PASS: " + (counts.pass || 0),
  "- FAIL: " + (counts.fail || 0),
  "- PENDING (comparación humana): " + (counts.pending || 0),
  "- Defectos abiertos: " + ledger.defects.length,
  "- G3 provisional: " + ledger.gates.G3,
  "", "## Defectos",
  ...(ledger.defects.length ? ledger.defects.map(d=>"- " + d.id + " [" + d.severity + "] " + d.route + " @" + d.viewport_width + "px — " + d.expected + ": " + d.observed) : ["Sin defectos detectados automáticamente."]),
  "", "## Capturas",
  ...routes.flatMap(r => sizes.map(s => "- " + s.width + "px-" + r.id + ".png")),
  "- 360px-menu-abierto.png",
  "- 390px-menu-abierto.png",
  "", "G3 NO puede aprobarse sin comparación visual humana de las capturas y validaciones adicionales.",
  ""
].join("\n");
await writeFile(join(outDir, "README.md"), markdown);
console.log("G3_SUMMARY " + JSON.stringify(ledger.summary));
console.log("G3_STATUS " + ledger.gates.G3);
if (critical.length) process.exitCode = 1; // CI should surface real P0/P1 failures.
