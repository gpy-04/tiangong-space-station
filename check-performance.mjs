import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/shangguan/.codex/skills/teardown/package.json');
const {chromium}=require('playwright');
const label=process.argv[2]||'after';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>window.__CAPTURE=true);
const started=Date.now();
await page.goto(pathToFileURL(process.cwd()+'/中国空间站_交互图鉴.html').href+'?nointro&inspect');
await page.waitForFunction(()=>window.SIM?.ready,{timeout:120000});
const readyMs=Date.now()-started,results=[];
for(const view of ['overview','insideWT','insideMT','insideLife','xray','exploded']){
 const result=await page.evaluate(async view=>{
  const a=TIANGONG,{renderer}=a.stage,gl=renderer.getContext();
  a.setState({cut:false,xray:0,explode:0,arm:false,dock:false,track:true,deploy:1,interior:false,paused:false});
  a.setView(view==='xray'||view==='exploded'?'overview':view,true);
  if(view==='xray')a.setState({xray:.88});
  if(view==='exploded')a.setState({explode:.8,xray:.25});
  SIM.render(10);gl.finish();
  const pose=[],frame=[],calls=[],triangles=[];
  for(let i=0;i<30;i++){
   const state={...a.state},t=10+(i+1)/60;
   let start=performance.now();a.station.pose(state,t);pose.push(performance.now()-start);
   start=performance.now();SIM.render(t);gl.finish();frame.push(performance.now()-start);
   calls.push(renderer.info.render.calls);triangles.push(renderer.info.render.triangles);
   await new Promise(requestAnimationFrame);
  }
  const median=a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)];
  return {view,frameMedianMs:median(frame),poseMedianMs:median(pose),calls:median(calls),submittedTriangles:median(triangles),stats:a.station.stats(),solar:a.station.solarMetrics(),quality:a.stage.performanceInfo?.()||null};
 },view);
 results.push(result);
 await page.screenshot({path:`tiangong/captures/performance-${label}-${view}.png`});
}
assert.equal(errors.length,0,errors.join('\n'));
const report={label,readyMs,htmlBytes:fs.statSync('中国空间站_交互图鉴.html').size,results,errors,note:'Same Chrome D3D11, viewport 1600x1000, 30 frames per view, GPU completion included. Not a universal FPS guarantee.'};
fs.writeFileSync(`tiangong/performance-${label}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
await browser.close();
