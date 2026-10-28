import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTelemetryServer, detectCrawler, safePath, scopedUuid } from "./server.mjs";
import { validateSchema, TABLE_NAMES, SITE_ID, SITE_HOST, DATABASE_NAME, createTelemetryDb } from "./db.mjs";

test("RAUVIA site routing, crawler recognition and ID isolation",()=>{
  assert.equal(SITE_ID,"monica-garcia");
  assert.equal(SITE_HOST,"monicagarcia.rauviaweb.mx");
  assert.equal(DATABASE_NAME,"u345974778_rauviaplatform");
  assert.equal(safePath("/perspectiva/?utm_source=x"),"/perspectiva/");
  assert.equal(safePath("/llms.txt?email=secret"),"/llms.txt");
  assert.equal(safePath("/private"),"/[other]");
  assert.equal(detectCrawler("GPTBot/1.0").name,"GPTBot");
  assert.equal(detectCrawler("Mozilla/5.0"),null);
  assert.match(scopedUuid("c4f1c740-b702-4e8f-9cec-e951b2fc1891"),/^[a-f0-9-]{36}$/);
  assert.ok(!scopedUuid("c4f1c740-b702-4e8f-9cec-e951b2fc1891").includes("c4f1c740"));
  assert.deepEqual(TABLE_NAMES,["visitors","sessions","web_events","ai_crawler_visits"]);
});
const tableColumns={
  visitors:["site_id","visitor_id","first_seen_at","last_seen_at"],
  sessions:["site_id","session_id","visitor_id","started_at","last_activity_at","landing_page","exit_page","referrer","utm_source","utm_medium","utm_campaign","device_type"],
  web_events:["site_id","visitor_id","session_id","event_name","event_timestamp","properties"],
  ai_crawler_visits:["site_id","crawler_name","crawler_family","user_agent","request_path","request_method","status_code","referer","requested_at","response_time_ms","ip_hash","properties"]
};
const mockMeta=()=>Object.fromEntries(Object.entries(tableColumns).map(([key,fields])=>[
  key,
  { columns:fields.map(Field=>({Field,Null:Field==="ip_hash"?"YES":"YES",Default:null,Extra:""})),
    indexes:["visitors","sessions"].includes(key)
    ? ["site_id",key==="visitors"?"visitor_id":"session_id"].map(Column_name=>({Non_unique:0,Key_name:"site_unique",Column_name}))
    : [] }
]));
test("schema check rejects unsafe global uniqueness and absent tables",()=>{
  assert.doesNotThrow(()=>validateSchema(mockMeta()));
  const missing=mockMeta();delete missing.sessions;
  assert.throws(()=>validateSchema(missing),/schema_mismatch/);
  const badUnique=mockMeta();
  badUnique.sessions.indexes.push({Non_unique:0,Key_name:"global_visitor",Column_name:"session_id"});
  assert.throws(()=>validateSchema(badUnique),/unsafe_global_unique_index/);
  const badPrivacy=mockMeta();badPrivacy.ai_crawler_visits.columns.find(c=>c.Field==="ip_hash").Null="NO";
  assert.throws(()=>validateSchema(badPrivacy),/privacy_schema_mismatch/);
  assert.throws(()=>createTelemetryDb({env:{TELEMETRY_ENABLED:"1",DB_NAME:"other"}}),/database_name_mismatch/);
  assert.throws(()=>createTelemetryDb({env:{TELEMETRY_ENABLED:"1",DB_NAME:DATABASE_NAME}}),/credentials/);
});
test("HTTP telemetry: page, click, crawler, blocked PII, and safe failure",async()=>{
  const root=await mkdtemp(join(tmpdir(),"monica-telem-"));
  await mkdir(join(root,"perspectiva"));
  await writeFile(join(root,"index.html"),"<main>Hola Mónica</main>");
  await writeFile(join(root,"perspectiva/index.html"),"<h1>Perspectiva</h1>");
  await writeFile(join(root,"llms.txt"),"Prueba de crawler");
  const writes={human:[],crawler:[]};
  const db={enabled:true,state:{schemaVerified:true,connected:true},
    writeHuman:async x=>{writes.human.push(x);},writeCrawler:async x=>{writes.crawler.push(x);},close:async()=>{}};
  const {server}=createTelemetryServer({db,root,env:{SITE_MODE:"preview"}});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const base="http://127.0.0.1:"+server.address().port;
  const visitor="c4f1c740-b702-4e8f-9cec-e951b2fc1891",session="a91b5d3f-1ed4-441e-9a2c-fc83ff113c80";
  const payload=(event,path="/")=>({site_id:SITE_ID,event,path,visitor_id:visitor,session_id:session,device_type:"desktop",properties:{email:"private@example.net",password:"secret",location:"hero"}});
  const post=(data,origin=base)=>fetch(base+"/api/telemetry",{method:"POST",headers:{"content-type":"application/json",origin},body:JSON.stringify(data)});
  try {
    const config=await (await fetch(base+"/api/telemetry/config")).json();
    assert.deepEqual(config,{enabled:true,site_id:SITE_ID});
    assert.equal((await post(payload("page_view","/perspectiva/?private=true"))).status,204);
    assert.equal((await post(payload("whatsapp_click"))).status,204);
    assert.equal((await post(payload("section_view","/"))).status,400);
    assert.equal((await post(payload("page_view","/secret"))).status,400);
    assert.equal((await post(payload("page_view"),"https://evil.example")).status,403);
    assert.equal((await post({...payload("page_view"),site_id:"allison-garcia"})).status,403);
    const r=await fetch(base+"/llms.txt?secret=123",{headers:{"User-Agent":"GPTBot/1.0"}});
    assert.equal(r.status,200);
    assert.equal(r.headers.get("x-robots-tag"),"noindex, nofollow");
    assert.equal((await fetch(base+"/perspectiva/")).status,200);
    await new Promise(resolve=>setTimeout(resolve,40));
    assert.equal(writes.human.length,2);
    assert.equal(writes.crawler.length,1);
    assert.equal(writes.human[0].path,"/perspectiva/");
    assert.equal(writes.crawler[0].properties.verified,false);
    assert.equal(writes.crawler[0].path,"/llms.txt");
    assert.deepEqual(writes.crawler[0].properties.page_type,"system_llm_dossier");
    assert.ok(!JSON.stringify(writes).includes("private@example.net"));
    assert.ok(!JSON.stringify(writes).includes("secret"));
    assert.ok(!JSON.stringify(writes).includes(visitor));
    assert.ok(!JSON.stringify(writes).includes("allison-garcia"));
  }finally{
    await new Promise(resolve=>server.close(resolve));
    await rm(root,{recursive:true,force:true});
  }
});
test("database adapter writes exact shared schema using injected fake SQL pool",async()=>{
  const calls=[];
  const meta=mockMeta();
  const pool={
    query:async sql=>{
      const table=sql.split(" ").at(-1);
      return [sql.startsWith("SHOW COLUMNS")?meta[table].columns:meta[table].indexes];
    },
    execute:async(sql,params)=>{calls.push({sql:sql.sql||sql,params});return [{affectedRows:1}];},
    end:async()=>{}
  };
  const db=createTelemetryDb({env:{
    TELEMETRY_ENABLED:"1",DB_NAME:DATABASE_NAME,DB_HOST:"test-host",DB_USER:"test-user",DB_PASSWORD:"test-only"
  },mysqlLoader:async()=>({createPool:()=>pool})});
  assert.equal((await db.check()).schemaVerified,true);
  await db.writeHuman({
    visitorId:scopedUuid("visitor"),sessionId:scopedUuid("session"),
    path:"/",event:"page_view",deviceType:"mobile",properties:{page_type:"professional_home"}
  });
  await db.writeCrawler({
    name:"GPTBot",family:"OpenAI",path:"/llms.txt",method:"GET",status:200,duration:15,
    properties:{page_type:"system_llm_dossier",verified:false}
  });
  assert.deepEqual(calls.length,4);
  assert.ok(calls.every(c=>c.params[0]===SITE_ID));
  assert.ok(calls.some(c=>c.sql.includes("INSERT INTO web_events")));
  assert.ok(calls.some(c=>c.sql.includes("INSERT INTO ai_crawler_visits")&&c.params.at(-2)===null));
  await db.close();
});
