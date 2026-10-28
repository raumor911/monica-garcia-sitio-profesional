#!/usr/bin/env node
// Auditoría estática, sin dependencias ni acceso a red.
import { readFile, rm, stat } from "node:fs/promises";
import { resolve, join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const canonicalOrigin="https://monicagarcia.rauviaweb.mx";
const pages=["index.html","como-puedo-ayudarte/index.html","perspectiva/index.html"];
const localFiles=[...pages,"cv.html","llms.txt","llms-full.txt","knowledge/monica-garcia.json","robots.txt","sitemap.xml","seo-pages.css"];
const publishedPath="dist/seo-qa";
const testOrigin="https://qa.rauviaweb.mx"; // Empleado SOLO en dist/seo-qa ignorado por Git.
let errors=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg);};
const read=(path)=>readFile(join(root,path),"utf8");
const pageContent={};
for(const path of pages){
  const html=await read(path);
  pageContent[path]=html;
  const route=path==="index.html" ? "/" : "/"+path.replace(/index\.html$/,"");
  const canonical=canonicalOrigin+route;
  check(html.includes(`rel="canonical" href="${canonical}"`),`${path}: canonical no coincide con dominio confirmado`);
  check(html.includes(`property="og:url" content="${canonical}"`),`${path}: og:url debe coincidir con canonical`);
  check(html.includes(`property="og:image" content="${canonicalOrigin}/assets/monica-garcia-ilustracion-hero.svg"`),`${path}: og:image debe ser una URL absoluta canónica`);
  check((html.match(/<h1(?:\s|>)/g)||[]).length===1,`${path}: debe existir exactamente un H1`);
  check((html.match(/<title>/g)||[]).length===1,`${path}: falta título único`);
  check((html.match(/name="description"/g)||[]).length===1,`${path}: metadescripción única requerida`);
  check(html.includes('id="profile-jsonld"'),`${path}: falta el grafo JSON-LD`);
  check(html.includes('name="robots" content="index,follow'),`${path}: verificar indexabilidad`);
  check(!html.includes("Universidad Iberoamericana")&&!html.includes("Tecnológico de Monterrey"),`${path}: universidad no confirmada en contenido público`);
  const tag=html.match(/<script\s+type="application\/ld\+json"\s+id="profile-jsonld">([\s\S]*?)<\/script>/);
  if(tag){try{
    const data=JSON.parse(tag[1]);check(data["@context"]==="https://schema.org",`${path}: contexto schema.org inválido`);
    check(data["@graph"].some(n=>n["@type"]==="Person"&&n.name==="Mónica García Urrutia"&&n["@id"]===canonicalOrigin+"/#monica-garcia"),`${path}: identidad Person debe apuntar a dominio canónico`);
  }catch(err){errors.push(`${path}: JSON-LD inválido (${err.message})`);}}
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const url=match[1];
    if(url.startsWith("#")||/^(https?:|mailto:|tel:|data:|javascript:)/.test(url))continue;
    const relative=url.split(/[?#]/)[0];if(!relative)continue;
    const target=resolve(root,dirname(path),decodeURIComponent(relative));
    if(!target.startsWith(root)) {errors.push(`${path}: enlace sale del repositorio: ${relative}`);continue;}
    try{const s=await stat(target);if(s.isDirectory())await stat(join(target,"index.html"));}
    catch{errors.push(`${path}: recurso local no existe: ${relative}`);}
  }
}
const titles=pages.map(p=>pageContent[p].match(/<title>([^<]+)<\/title>/)?.[1]);
check(new Set(titles).size===pages.length,"Títulos duplicados");
const cv=await read("cv.html");
check(/name="robots"\s+content="noindex/.test(cv),"El CV imprimible debe conservar noindex");
const home=pageContent["index.html"];
const skillsSection=home.split('<section class="section section-cream skills-section"')[1]?.split('</section>')[0] ?? "";
check((skillsSection.match(/class="brand-tool"/g)||[]).length===8,"El mockup exige ocho insignias de herramientas");
check((skillsSection.match(/class="language-item"/g)||[]).length===3,"El mockup exige tres idiomas");
check((skillsSection.match(/<li>/g)||[]).length===18,"La sección de habilidades debe contener diez chips y ocho marcas");
check(skillsSection.includes("Product Operations (en desarrollo)"),"La transición hacia Product Operations debe figurar como desarrollo");
check(skillsSection.includes('class="visually-hidden" id="skills-title"'),"El título grande de habilidades debe permanecer oculto visualmente, pero accesible");
check(["salesforce","guesty","monday","stripe","mailchimp","payana","notion","google-workspace","lang-es","lang-uk","lang-fr"].every(slug=>skillsSection.includes("assets/skills/"+slug+".svg")),"Faltan recursos SVG del mockup");

check(home.includes('href="como-puedo-ayudarte/"')&&home.includes('href="perspectiva/"'),"La portada debe enlazar las páginas de intención");
const knowledge=JSON.parse(await read("knowledge/monica-garcia.json"));
check(knowledge.verified_externally===false,"Evitar afirmar verificación externa de métricas");
check(Array.isArray(knowledge.unconfirmed)&&knowledge.unconfirmed.some(x=>x.includes("universidad")),"Registrar discrepancia académica");
check((await read("llms.txt")).toLowerCase().includes("no se presenta como product owner"),"Aclarar transición en llms.txt");
check((await read("llms.txt")).includes(canonicalOrigin+"/perspectiva/"),"llms.txt debe enlazar el dominio confirmado");
check((await read("robots.txt")).includes("Sitemap: "+canonicalOrigin+"/sitemap.xml"),"robots.txt raíz debe apuntar al sitemap canónico");
const sourceSitemap=await read("sitemap.xml");
check((sourceSitemap.match(/<loc>/g)||[]).length===3,"El sitemap raíz debe tener tres rutas");
check(sourceSitemap.includes("<loc>"+canonicalOrigin+"/</loc>"),"Falta la portada en sitemap raíz");
check(!sourceSitemap.includes("/cv.html"),"El CV no debe aparecer en sitemap raíz");
check(knowledge.entity.url===canonicalOrigin+"/","La identidad del registro de evidencia debe enlazar al dominio canónico");
for(const p of localFiles){try{await stat(join(root,p));}catch{errors.push(`Falta recurso ${p}`);}}

if(errors.length===0){
  const args=["scripts/build-seo.mjs","--site-url",testOrigin,"--out-dir",publishedPath];
  const run=spawnSync(process.execPath,args,{cwd:root,encoding:"utf8"});
  check(run.status===0,"No se generó el paquete SEO: "+(run.stderr||run.stdout));
}
if(errors.length===0){
  const paths=[{path:"index.html",url:"/"},{path:"como-puedo-ayudarte/index.html",url:"/como-puedo-ayudarte/"},{path:"perspectiva/index.html",url:"/perspectiva/"}];
  for(const page of paths){
    const built=await read(join(publishedPath,page.path));
    const expected=testOrigin+page.url;
    check((built.match(/rel="canonical"/g)||[]).length===1,`${page.path}: canonical duplicado o ausente`);
    check(built.includes(`rel="canonical" href="${expected}"`),`${page.path}: canonical incorrecto`);
    check(built.includes(`property="og:url" content="${expected}"`),`${page.path}: og:url incorrecto`);
    check(/property="og:image" content="https:\/\//.test(built),`${page.path}: og:image debe ser absoluto`);
    const data=JSON.parse(built.match(/<script\s+type="application\/ld\+json"\s+id="profile-jsonld">([\s\S]*?)<\/script>/)[1]);
    check(data["@graph"].some(n=>n["@type"]==="Person"&&n["@id"]===testOrigin+"/#monica-garcia"),`${page.path}: @id Person inconsistente`);
  }
  const sitemap=await read(join(publishedPath,"sitemap.xml"));
  check((sitemap.match(/<loc>/g)||[]).length===3,"Sitemap solo debe contener tres páginas indexables");
  check(!sitemap.includes("/cv.html"),"El CV noindex no debe figurar en sitemap");
  check((await read(join(publishedPath,"robots.txt"))).includes("Sitemap: "+testOrigin+"/sitemap.xml"),"Robots debe apuntar al sitemap del dominio real");
  check((await read(join(publishedPath,"llms.txt"))).includes(testOrigin+"/perspectiva/"),"Enlaces llms deben ser absolutos en producción");
}
await rm(join(root,publishedPath),{recursive:true,force:true});
if(errors.length){
  console.error("Validación SEO/LLMO fallida:\n- "+errors.join("\n- "));
  process.exit(1);
}
console.log("SEO/LLMO QA OK: tres páginas semánticas, JSON-LD, enlaces, canonical, sitemap, robots, CV noindex, llms y evidencia.");
