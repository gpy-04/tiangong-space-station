import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire('C:/Users/shangguan/.codex/skills/teardown/package.json'),{chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.__CAPTURE=true);
try{
 await page.goto(pathToFileURL(process.cwd()+'/中国空间站_交互图鉴.html').href+'?nointro&inspect');await page.waitForFunction(()=>window.SIM?.ready,{timeout:120000});
 await page.evaluate(()=>{TIANGONG.setView('insideLife',true);SIM.render(2)});
 const closure=await page.evaluate(()=>TIANGONG.auditHatchClosure());
 console.log(JSON.stringify(closure,null,2));assert(closure.passed,'Forward end does not close');
 const topology=await page.evaluate(()=>{
  const g=TIANGONG.station.modules.tianhe.getObjectByName('天和前端舱壁与舱门');
  return ['前端连续环形封板 / 舱壳安装搭接','前端关闭舱门 / 连续实体门板'].map(name=>{
   const geometry=g.getObjectByName(name).geometry,p=geometry.attributes.position,idx=geometry.index,count=idx?idx.count:p.count,vertices=new Map(),edges=new Map();let degenerate=0,volume=0;
   const vertex=i=>[p.getX(i),p.getY(i),p.getZ(i)],key=v=>v.map(x=>Math.round(x*1e6)).join(',');
   for(let i=0;i<count;i+=3){
    const a=vertex(idx?idx.getX(i):i),b=vertex(idx?idx.getX(i+1):i+1),c=vertex(idx?idx.getX(i+2):i+2),vs=[a,b,c];
    const ids=vs.map(v=>{const k=key(v);if(!vertices.has(k))vertices.set(k,vertices.size);return vertices.get(k);});
    const u=b.map((v,k)=>v-a[k]),v=c.map((v,k)=>v-a[k]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(new Set(ids).size!==3||Math.hypot(...cross)<1e-12)degenerate++;
    volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
    for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],k=Math.min(a,b)+','+Math.max(a,b),e=edges.get(k)||{count:0,direction:0};e.count++;e.direction+=a<b?1:-1;edges.set(k,e);}
   }
   const unpairedEdges=[...edges.values()].filter(e=>e.count!==2).length,inconsistentEdges=[...edges.values()].filter(e=>e.direction!==0).length;
   return {name,triangles:count/3,weldedVertices:vertices.size,unpairedEdges,inconsistentEdges,degenerate,signedVolume:volume,passed:unpairedEdges===0&&inconsistentEdges===0&&degenerate===0&&volume>0};
  });
 });
 assert(topology.every(r=>r.passed),JSON.stringify(topology));
 const views=[
  {name:'hatch-sealed-closeup',pos:[0,.30,2.70],target:[0,-.25,1.4]},
  {name:'hatch-sealed-lower-junction',pos:[0,-.69,1.98],target:[0,-.90,1.44]},
  {name:'hatch-sealed-oblique',pos:[-.30,.63,2.18],target:[.2,.12,1.44]},
  {name:'hatch-sealed-wide',pos:[0,.4,6.35],target:[0,-.18,2.1]}
 ];
 for(const v of views){await page.evaluate(v=>{const {camera,controls}=TIANGONG.stage;camera.position.set(...v.pos);controls.target.set(...v.target);camera.lookAt(controls.target);TIANGONG.freeCamera.enter('tianhe');SIM.render(2)},v);await page.screenshot({path:`tiangong/captures/${v.name}.png`});}
 // Normal free-camera movement must stop on the actual hatch, including its
 // off-axis annular portion, with the same radius as all other cabin fixtures.
 const contacts=[];
 for(const [x,y]of[[0,.3],[.24,.6],[-.2,-.72]]){
  await page.evaluate(([x,y])=>{TIANGONG.setView('insideLife',true);const {camera,controls}=TIANGONG.stage;camera.position.set(x,y,1.9);controls.target.set(x,y,1.1);camera.lookAt(controls.target);TIANGONG.freeCamera.enter('tianhe');TIANGONG.freeCamera.relocate(camera.position.clone().setZ(1));SIM.render(3)},[x,y]);
  const q=await page.evaluate(()=>TIANGONG.freeCamera.inspect());assert(q.distanceToSurface>=.118,JSON.stringify(q));assert(q.position[2]>1.66,JSON.stringify(q));contacts.push(q);
 }
 // Defect injection: removing the annular panel must be detected, even though
 // the node's white sphere and the closed door remain in the scene.
 const negative=await page.evaluate(()=>{const g=TIANGONG.station.modules.tianhe.getObjectByName('天和前端舱壁与舱门'),m=g.getObjectByName('前端连续环形封板 / 舱壳安装搭接');g.remove(m);const r=TIANGONG.auditHatchClosure();g.add(m);return r;});assert(!negative.passed&&negative.misses>0);
 assert.equal(errors.length,0,errors.join('\n'));
 const result={passed:true,closure,topology,contacts,negativeControl:{passed:!negative.passed,detectedMissingPanelRays:negative.misses},errors};fs.writeFileSync('tiangong/hatch-closure-validation.json',JSON.stringify(result,null,2));
 console.log('Hatch closure, approach collision and missing-panel negative control passed.');
}finally{await browser.close();}
