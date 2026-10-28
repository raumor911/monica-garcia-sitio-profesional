#!/usr/bin/env node
/** TEKTARYON G3 — motion & accessibility across six widths. */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const base=process.env.VISUAL_QA_BASE_URL||"http://127.0.0.1:4173";
const out=process.env.VISUAL_QA_OUTPUT_DIR||"qa/visual-results";
const widths=[360,390,768,1024,1440,1920];
const routes=["/","/como-puedo-ayudarte/","/perspectiva/"];
const checks=[];
function report(label,route,width,pass,details) {
  checks.push({label,route,width,status:pass?"pass":"fail",details});
}
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try {
 for(const width of widths){
  const height=width<=390?844:width<=768?1024:width<=1440?900:1080;
  const context=await browser.newContext({viewport:{width,height},locale:"es-MX",reducedMotion:"no-preference"});
  for(const route of routes){
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:25000});
   await page.waitForTimeout(170);
   let enabled=await page.evaluate(()=>document.documentElement.classList.contains("premium-motion-active"));
   report("motion-initialized",route,width,enabled,"premium-motion-active="+enabled);
   if(route==="/"){
    const groups=[
      [".value-card","data-motion-revealed","true"],
      [".timeline","class","premium-line-drawn"],
      [".language-levels","class","premium-bars-filled"]
    ];
    for(const [sel,kind,expected] of groups){
      const loc=page.locator(sel).first();
      await loc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(290);
      const value=kind==="class"
        ? await loc.evaluate((el,c)=>el.classList.contains(c),expected)
        : await loc.getAttribute(kind);
      report("scroll-activate-"+sel,route,width,kind==="class"?value===true:value===expected,String(value));
    }
    await page.locator(".hero-visual .motion-toggle").click();
    await page.waitForTimeout(110);
    const paused=await page.evaluate(()=>document.documentElement.classList.contains("motion-paused")
      && !document.documentElement.classList.contains("premium-motion-active")
      && !document.querySelector(".premium-motion-pending"));
    report("global-pause",route,width,paused,"Pause completes reveals & preserves content");
    // Resume illustration animations before the normal-mode evidence capture.
    await page.locator(".hero-visual .motion-toggle").click();
    const resumed=await page.evaluate(()=>!document.documentElement.classList.contains("motion-paused"));
    report("resume-illustrations",route,width,resumed,"Toggle resumes the two illustrations without replaying editorial entrances");
   }else{
    const sel=route.includes("perspectiva")?".story-stack > div":".content-grid article";
    const loc=page.locator(sel).first();
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
    const value=await loc.getAttribute("data-motion-revealed");
    report("interior-reveal",route,width,value==="true",sel+"="+value);
   }
   await page.evaluate(()=>scrollTo(0,0));
   await page.waitForTimeout(750);
   const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
   report("motion-no-horizontal-overflow",route,width,overflow<=2,"overflow="+overflow);
   if(route==="/"&&(width===390||width===1440)){
    await page.screenshot({path:join(out,width+"px-premium-motion.png"),fullPage:true,animations:"disabled"});
   }
   await page.emulateMedia({reducedMotion:"reduce"});
   await page.reload({waitUntil:"domcontentloaded"});
   await page.waitForTimeout(90);
   const reducedVisible=await page.evaluate(()=>{
     const title=document.querySelector("main h1");
     return !document.documentElement.classList.contains("premium-motion-active")
       && !!title && getComputedStyle(title).opacity==="1";
   });
   report("reduced-motion-visible",route,width,reducedVisible,"H1 visible without motion");
   report("no-runtime-errors",route,width,errors.length===0,errors);
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close();}
const totals=checks.reduce((acc,x)=>{acc[x.status]++;return acc;},{pass:0,fail:0});
await writeFile(join(out,"premium-motion-qa.json"),JSON.stringify({
 schema:"TEKTARYON-MOTION-G3-0.1",sha:process.env.GITHUB_SHA||null,created_at:new Date().toISOString(),
 widths,routes,totals,checks
},null,2)+"\n");
console.log("MOTION_QA "+JSON.stringify(totals));
console.log("MOTION_FAILS "+JSON.stringify(checks.filter(x=>x.status==="fail")));
if(totals.fail) process.exitCode=1;