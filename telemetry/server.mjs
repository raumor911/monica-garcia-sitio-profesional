/**
 * Optional RAUVIAWEB Hostinger Node server.
 * Serves generated dist/ and writes telemetry to the shared RAUVIA MySQL schema.
 * Never expose DB credentials or connect to MySQL from the browser.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { resolve, extname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createTelemetryDb, SITE_ID, SITE_HOST } from "./db.mjs";

export const PAGES = Object.freeze({
  "/": ["professional_home","professional_identity"],
  "/como-puedo-ayudarte/": ["professional_capabilities","problem_fit"],
  "/perspectiva/": ["professional_profile","trajectory_credibility"],
  "/robots.txt": ["system_robots","crawler_directives"],
  "/sitemap.xml": ["system_sitemap","indexing_manifest"],
  "/llms.txt": ["system_llm_dossier","llm_grounding"],
  "/llms-full.txt": ["system_llm_dossier","llm_context_extended"]
});
const CRAWLERS = [
  [/OAI-SearchBot/i,"OAI-SearchBot","OpenAI"],[/GPTBot/i,"GPTBot","OpenAI"],
  [/ChatGPT-User/i,"ChatGPT-User","OpenAI"],[/ClaudeBot/i,"ClaudeBot","Anthropic"],
  [/anthropic-ai/i,"anthropic-ai","Anthropic"],[/PerplexityBot/i,"PerplexityBot","Perplexity"],
  [/Googlebot/i,"Googlebot","Google"],[/Google-Extended/i,"Google-Extended","Google"],
  [/bingbot/i,"bingbot","Microsoft"],[/Meta-ExternalAgent/i,"Meta-ExternalAgent","Meta"],
  [/facebookexternalhit/i,"facebookexternalhit","Meta"],[/Bytespider/i,"Bytespider","ByteDance"],
  [/Applebot/i,"Applebot","Apple"],[/CCBot/i,"CCBot","CommonCrawl"],
  [/Amazonbot/i,"Amazonbot","Amazon"],[/LinkedInBot/i,"LinkedInBot","LinkedIn"],
  [/Twitterbot/i,"Twitterbot","Twitter"],[/DuckDuckBot/i,"DuckDuckBot","DuckDuckGo"],
  [/Baiduspider/i,"Baiduspider","Baidu"],[/YandexBot/i,"YandexBot","Yandex"]
];
export function detectCrawler(agent = "") {
  if (typeof agent !== "string") return null;
  for (const [pattern,name,family] of CRAWLERS) {
    if (pattern.test(agent)) return { name, family, verified: false };
  }
  return /bot|crawler|spider|slurp|archiver/i.test(agent)
    ? { name:"generic-crawler",family:"Other",verified:false } : null;
}
export function safePath(raw) {
  if (typeof raw !== "string" || raw.length > 1024) return "/[other]";
  try {
    const p = new URL(raw, "https://" + SITE_HOST).pathname;
    if (p === "/index.html") return "/";
    const normalized = p === "/" ? "/" : p.replace(/\/+$/, "") + "/";
    if (PAGES[normalized]) return normalized;
    if (PAGES[p]) return p;
    return "/[other]";
  } catch { return "/[other]"; }
}
function semantic(path) {
  const [page_type,semantic_intent] = PAGES[path] || ["other_page","general_navigation"];
  return { page_type,semantic_intent,site_id:SITE_ID,host:SITE_HOST,path,verified:false };
}
export function scopedUuid(raw) {
  const hash = createHash("sha256").update(SITE_ID + ":" + raw).digest("hex");
  return hash.slice(0,8)+"-"+hash.slice(8,12)+"-5"+hash.slice(13,16)+"-a"+hash.slice(17,20)+"-"+hash.slice(20,32);
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENTS = new Set(["page_view","section_view","whatsapp_click","rauvia_click"]);
const MIME = {
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
  ".xml":"application/xml; charset=utf-8",".json":"application/json; charset=utf-8",
  ".txt":"text/plain; charset=utf-8",".ico":"image/x-icon"
};
export function createTelemetryServer({ env=process.env, db=createTelemetryDb({env}), root=resolve(fileURLToPath(new URL("../dist",import.meta.url))) }={}) {
  const publicRoot=resolve(root);
  const active=Boolean(db.enabled);
  const mode=env.SITE_MODE==="production"?"production":"preview";
  const secret=randomBytes(32);
  const rate = new Map();
  const crawlerCache = new Map();
  let pending=0;
  const queue=(task)=>{
    if(pending>=24)return;
    pending++;
    setImmediate(()=>Promise.resolve().then(task).catch(()=>{}).finally(()=>{pending--;}));
  };
  function limit(ip){
    const now=Date.now();
    for(const [k,v] of rate)if(v.until<=now)rate.delete(k);
    const key=createHmac("sha256",secret).update(String(ip||"unknown")).digest("hex");
    if(!rate.has(key)){if(rate.size>=1500)return false;rate.set(key,{until:now+60000,count:0});}
    const value=rate.get(key);
    return ++value.count<=60;
  }
  function crawlerLog(path,req,status,duration){
    if (!active || !["GET","HEAD"].includes(req.method)) return;
    if(!PAGES[path])return;
    const crawler=detectCrawler(req.headers["user-agent"]);
    if(!crawler)return;
    const time=Date.now(), key=crawler.name+":"+path+":"+status+":"+req.method;
    for(const [k,t]of crawlerCache)if(time-t>=60000)crawlerCache.delete(k);
    if(crawlerCache.has(key))return;
    if(crawlerCache.size>=1000)crawlerCache.delete(crawlerCache.keys().next().value);
    crawlerCache.set(key,time);
    queue(()=>db.writeCrawler({
      ...crawler,path,method:req.method,status,duration,
      properties:{...semantic(path),detection_method:"user_agent",verified:false}
    }));
  }
  function commonHeaders(res){
    res.setHeader("X-Content-Type-Options","nosniff");
    res.setHeader("Referrer-Policy","no-referrer");
    res.setHeader("X-Frame-Options","DENY");
    res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
    if(mode!=="production")res.setHeader("X-Robots-Tag","noindex, nofollow");
  }
  function send(res,status,body="",type="text/plain; charset=utf-8"){
    res.statusCode=status;
    res.setHeader("Content-Type",type);
    if(status===204||status===304){res.end();return;}
    res.end(body);
  }
  const server=createServer(async(req,res)=>{
    commonHeaders(res);
    const started=Date.now();
    let path;
    try {path=new URL(req.url||"/","http://localhost").pathname;} catch {return send(res,400);}
    if(path==="/healthz"){
      if(req.method!=="GET")return send(res,405);
      const status={site_id:SITE_ID,enabled:active,db_schema_verified:Boolean(db.state?.schemaVerified),db_connected:Boolean(db.state?.connected)};
      res.setHeader("Cache-Control","no-store");
      return send(res,200,JSON.stringify(status),"application/json");
    }
    if(path==="/api/telemetry/config"){
      if(req.method!=="GET")return send(res,405);
      res.setHeader("Cache-Control","no-store");
      return send(res,200,JSON.stringify({enabled:active,site_id:SITE_ID}),"application/json");
    }
    if(path==="/api/telemetry"){
      if(req.method!=="POST")return send(res,405);
      if(!active)return send(res,204);
      const origin=req.headers.origin;
      const currentOrigin=mode==="production"?"https://"+SITE_HOST:"http://"+(req.headers.host||"localhost");
      if((origin && origin!==currentOrigin)||req.headers["sec-fetch-site"]==="cross-site")return send(res,403);
      if(!limit(req.socket.remoteAddress))return send(res,429);
      if(!(req.headers["content-type"]||"").toLowerCase().startsWith("application/json"))return send(res,415);
      let body="";
      try {
        for await (const chunk of req){
          body+=chunk.toString("utf8");
          if(Buffer.byteLength(body)>4096)return send(res,413);
        }
        const data=JSON.parse(body);
        if(!data||typeof data!=="object"||!EVENTS.has(data.event)||
           !UUID.test(data.visitor_id)||!UUID.test(data.session_id)||
           !["mobile","tablet","desktop"].includes(data.device_type))return send(res,400);
        if(detectCrawler(req.headers["user-agent"]))return send(res,204);
        if(data.site_id && data.site_id!==SITE_ID)return send(res,403);
        const pathname=safePath(data.path);
        if(!["/","/como-puedo-ayudarte/","/perspectiva/"].includes(pathname))return send(res,400);
        const properties={...semantic(pathname)};
        if(data.event==="section_view"){
          if(typeof data.properties?.section!=="string"||!/^[a-z0-9_-]{1,60}$/i.test(data.properties.section))return send(res,400);
          properties.section=data.properties.section;
        }
        if(["whatsapp_click","rauvia_click"].includes(data.event)){
          const location=data.properties?.location;
          if(!["header","hero","content","footer","other"].includes(location))return send(res,400);
          properties.location=location;
        }
        const ids={visitorId:scopedUuid(data.visitor_id),sessionId:scopedUuid(data.session_id)};
        send(res,204);
        queue(()=>db.writeHuman({...ids,path:pathname,event:data.event,deviceType:data.device_type,properties}));
      }catch{if(!res.writableEnded)send(res,400);}
      return;
    }
    if(!["GET","HEAD"].includes(req.method))return send(res,405);
    try {
      const clean=new URL(req.url,"http://localhost");
      const pathname=decodeURIComponent(clean.pathname);
      if(pathname.includes("\0") || pathname.split("/").some(x=>x===".." || x.startsWith(".")))return send(res,404);
      let filename=pathname;
      if(filename.endsWith("/"))filename+="index.html";
      if(!extname(filename))filename+="/index.html";
      const target=resolve(publicRoot,"."+filename);
      if(target!==publicRoot&&!target.startsWith(publicRoot+sep))return send(res,404);
      const info=await stat(target);
      if(!info.isFile())return send(res,404);
      const body=await readFile(target);
      res.statusCode=200;
      res.setHeader("Content-Type",MIME[extname(target).toLowerCase()]||"application/octet-stream");
      res.setHeader("Cache-Control",extname(target)===".html"?"public, max-age=300":"public, max-age=3600");
      if(req.method==="HEAD")res.end();else res.end(body);
      crawlerLog(safePath(pathname),req,200,Date.now()-started);
    }catch{
      send(res,404,"Not found");
      crawlerLog(safePath(path),req,404,Date.now()-started);
    }
  });
  return {server,db};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const env=process.env;
  let instance;
  try {instance=createTelemetryServer({env});}
  catch(e){console.error("Telemetry configuration error:",e.message);process.exit(1);}
  if(process.argv.includes("--check-db")){
    const status=await instance.db.check();
    console.log(JSON.stringify(status));
    await instance.db.close();
    if(!status.schemaVerified)process.exitCode=1;
  }else{
    const port=Number(env.PORT||4173),host=env.HOST||"127.0.0.1";
    instance.server.listen(port,host,()=>console.log("RAUVIAWEB preview/server listening on "+host+":"+port));
    const stop=()=>instance.server.close(async()=>{await instance.db.close();process.exit(0);});
    process.on("SIGINT",stop);process.on("SIGTERM",stop);
  }
}
