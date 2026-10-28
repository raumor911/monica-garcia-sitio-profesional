#!/usr/bin/env node
// Genera archivos SEO con el dominio canónico confirmado de Mónica.
// Uso: npm run seo:build (o --site-url para validar un origen alternativo en QA).
import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2);
function getArg(flag) { const i=args.indexOf(flag); return i>=0 ? args[i+1] : null; }
const canonicalOrigin = "https://monicagarcia.rauviaweb.mx";
const rawSiteUrl = getArg("--site-url") ?? process.env.SITE_URL ?? canonicalOrigin;
let url;
try { url=new URL(rawSiteUrl); }
catch { console.error("SITE_URL no es una URL válida"); process.exit(2); }
if (url.protocol!=="https:" || !url.hostname || url.username || url.password || url.pathname!=="/" || url.search || url.hash || /(?:^|\.)((?:example|test|invalid)|localhost|local)(?:\.|$)/i.test(url.hostname)) {
  console.error("SITE_URL debe ser el origen HTTPS definitivo, sin rutas, puerto de prueba ni dominios de ejemplo.");
  process.exit(2);
}
const origin=url.origin;
const dirArg=getArg("--out-dir") ?? "dist";
const out=resolve(root,dirArg);
if (out===root || out===resolve(root,"..") || !out.startsWith(root+sep)) {
  console.error("--out-dir debe ser un directorio hijo del repositorio distinto de la raíz.");
  process.exit(2);
}
const pages=[
  {src:"index.html",route:"/"},
  {src:"como-puedo-ayudarte/index.html",route:"/como-puedo-ayudarte/"},
  {src:"perspectiva/index.html",route:"/perspectiva/"}
];
const local=(pathname)=>origin+pathname;
const escapeXml=(s)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const escapeAttr=escapeXml;
// Rebasa referencias del sitio oficial cuando la prueba usa otro origen.
const siteUrl=(raw,route="/")=>{
  const u=new URL(raw,new URL(route,canonicalOrigin));
  if(u.origin!==canonicalOrigin) return u.href;
  return origin+u.pathname+u.search+u.hash;
};

function prepareHtml(raw,route) {
  const canonical=local(route);
  if (!/<meta\s+name="description"/.test(raw) || !/<script[^>]+id="profile-jsonld"/.test(raw)) {
    throw new Error("Página sin metadescripción o estructura semántica: "+route);
  }
  let html=raw.replace(/\s*<link\s+rel="canonical"[^>]*>/g,"").replace(/\s*<meta\s+property="og:url"[^>]*>/g,"").replace(/\s*<meta\s+name="twitter:image"[^>]*>/g,"");
  html=html.replace(/(<meta\s+property="og:image"\s+content=")([^"]+)("[^>]*>)/,(whole,start,value,end)=>start+escapeAttr(siteUrl(value,route))+end);
  const pic=html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/)?.[1];
  const meta=[
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    ...(pic ? [`<meta name="twitter:image" content="${escapeAttr(pic)}" />`] : [])
  ].join("\n  ");
  html=html.replace("</head>",`  ${meta}\n</head>`);
  const re=/<script\s+type="application\/ld\+json"\s+id="profile-jsonld">([\s\S]*?)<\/script>/;
  const match=html.match(re);
  if(!match) throw new Error("JSON-LD principal no encontrado: "+route);
  let data;
  try { data=JSON.parse(match[1]); } catch(e) { throw new Error("JSON-LD inválido: "+route+" "+e.message); }
  if (!Array.isArray(data["@graph"])) throw new Error("El grafo JSON-LD carece de @graph: "+route);
  for (const node of data["@graph"]) {
    if (typeof node["@id"]==="string") node["@id"]=siteUrl(node["@id"]);
    if (typeof node.mainEntity?.["@id"]==="string") node.mainEntity["@id"]=siteUrl(node.mainEntity["@id"]);
    if (typeof node.publisher?.["@id"]==="string") node.publisher["@id"]=siteUrl(node.publisher["@id"]);
    if(node["@type"]==="Person" || node["@type"]==="WebSite") node.url=local("/");
    if(["ProfilePage","AboutPage"].includes(node["@type"])) node.url=canonical;
  }
  html=html.replace(re,`<script type="application/ld+json" id="profile-jsonld">${JSON.stringify(data).replace(/</g,"\\u003c")}<\/script>`);
  return html;
}
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for (const item of ["styles.css","seo-pages.css","app.js","cv.html","llms-full.txt"]) {
  await copyFile(join(root,item),join(out,item));
}
await cp(join(root,"assets"),join(out,"assets"),{recursive:true});
// Browser-only telemetry module is public; server and DB adapters remain private.
await mkdir(join(out,"telemetry"),{recursive:true});
await copyFile(join(root,"telemetry/client.js"),join(out,"telemetry/client.js"));
await cp(join(root,"knowledge"),join(out,"knowledge"),{recursive:true});
for (const page of pages){
  const content=await readFile(join(root,page.src),"utf8");
  const outputPath=join(out,page.src);
  await mkdir(resolve(outputPath,".."),{recursive:true});
  await writeFile(outputPath,prepareHtml(content,page.route),"utf8");
}
const rawLLMs=await readFile(join(root,"llms.txt"),"utf8");
const llms=rawLLMs.replace(/\]\(\.\/(.*?)\)/g,(_m,path)=>`](${origin}/${path})`).replaceAll(canonicalOrigin,origin);
await writeFile(join(out,"llms.txt"),llms,"utf8");
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p=>`  <url><loc>${escapeXml(local(p.route))}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(join(out,"sitemap.xml"),sitemap,"utf8");
await writeFile(join(out,"robots.txt"),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,"utf8");
const knowledge=JSON.parse(await readFile(join(root,"knowledge/monica-garcia.json"),"utf8"));
knowledge.entity.url=local("/");
for(const claim of knowledge.claims) claim.public_url=local(claim.public_page);
await writeFile(join(out,"knowledge/monica-garcia.json"),JSON.stringify(knowledge,null,2)+"\n","utf8");
console.log("SEO package generated in",relative(root,out));
console.log("Canonical origin:",origin);
console.log("Indexed pages:",pages.length,"(CV intentionally noindex)");
