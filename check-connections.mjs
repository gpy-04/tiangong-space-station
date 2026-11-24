import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire('C:/Users/shangguan/.codex/skills/teardown/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>window.__CAPTURE=true);
await page.goto(pathToFileURL(process.cwd()+'/中国空间站_交互图鉴.html').href+'?nointro&inspect');
await page.waitForFunction(()=>window.SIM?.ready,{timeout:120000});
const result=await page.evaluate(()=>{
 const a=TIANGONG,T=a.stage,V=T.camera.position.constructor,root=a.station.root,node=root.getObjectByName('节点舱'),shell=node.getObjectByName('节点舱球形承压壳 / 五处接口开孔'),geometry=shell.geometry,pos=geometry.attributes.position,openDirections=[{axis:[-1,0,0],cos:.811},{axis:[1,0,0],cos:.811},{axis:[0,0,-1],cos:.811},{axis:[0,-1,0],cos:.80},{axis:[0,0,1],cos:.68}],portCounts=[];
 for(const {axis:d,cos} of openDirections){let hits=0;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),L=Math.hypot(x,y,z);if((x*d[0]+y*d[1]+z*d[2])/L>cos+1e-5)hits++;}portCounts.push({direction:d,remainingVertices:hits});}
 const adapters=[];node.traverse(o=>{if(o.userData.interface){o.updateWorldMatrix(true,false);adapters.push({name:o.name,...o.userData.interface,worldPosition:o.getWorldPosition(new V()).toArray()});}});
 const neck=root.getObjectByName('天和与节点舱连续变径连接段'),tailEnds=[];for(const kind of['tianhe','wentian','mengtian']){const hulls=[];a.station.modules[kind].traverse(o=>{if(o.name==='多层隔热与防护壳')hulls.push(o);});let end=-Infinity,radii=[];for(const hull of hulls){const p=hull.geometry.attributes.position;for(let i=0;i<p.count;i++)end=Math.max(end,p.getZ(i));}for(const hull of hulls){const p=hull.geometry.attributes.position;for(let i=0;i<p.count;i++)if(Math.abs(p.getZ(i)-end)<1e-4)radii.push(Math.hypot(p.getX(i),p.getY(i)));}tailEnds.push({module:kind,end,minimumRadius:Math.min(...radii),maximumRadius:Math.max(...radii)});}const spacecraftMatingPlane=root.getObjectByName('天舟货运飞船').position.z,shipClearance=[];for(const [explode,dock,time]of[[0,false,0],[.8,false,0],[0,true,0],[0,true,3],[0,true,7],[.8,true,11]]){a.station.pose({...a.state,explode,dock},time);root.updateMatrixWorld(true);const core=a.station.modules.tianhe.position.z,front=root.getObjectByName('神舟载人飞船').getWorldPosition(new V()).z,aft=root.getObjectByName('天舟货运飞船').getWorldPosition(new V()).z;shipClearance.push({explode,dock,time,frontGap:core-1.72-front,aftGap:aft-core-15.1});}a.station.pose(a.state,0);return {openPorts:portCounts,adapters,coreNodeContact:neck.userData.contact,tailEnds,spacecraftMatingPlane,shipClearance,station:a.station.stats()};
});
if(result.openPorts.some(p=>p.remainingVertices!==0))throw Error('A port remains covered by node shell: '+JSON.stringify(result.openPorts));
if(result.adapters.length!==4||result.adapters.some(p=>Math.abs((p.outerRadius-p.innerRadius)-p.wall)>1e-6))throw Error('Pressure adapters do not have continuous, constant-thickness mating edges: '+JSON.stringify(result.adapters));
for(const tail of result.tailEnds){const core=tail.module==='tianhe',expected=core?result.spacecraftMatingPlane:17.5,radius=core?.75:.83;if(Math.abs(tail.end-expected)>1e-4||Math.abs(tail.maximumRadius-radius)>.007||tail.minimumRadius>radius-.05)throw Error('Tail shell is disconnected from its end flange: '+JSON.stringify(tail));}
if(result.shipClearance.some(s=>s.frontGap<-.00001||s.aftGap<-.00001))throw Error('A visiting spacecraft crosses the station during docking or teardown: '+JSON.stringify(result.shipClearance));
const views=[['joint-core-solid',{cut:false,xray:0,explode:0},[3.8,2.4,4.1],[0,0,1.25]],['joint-core-lower',{cut:false,xray:0,explode:0},[3.1,-1.8,3.2],[0,0,1.25]],['joint-core-cut',{cut:true,xray:0,explode:0},[3.8,2.4,4.1],[0,0,1.25]],['joint-core-exploded',{cut:false,xray:.25,explode:.18},[3.8,2.4,4.1],[0,0,1.25]],['joint-mengtian-solid',{cut:false,xray:0,explode:0},[4.25,2.1,2.8],[1.15,0,0]],['joint-wentian-solid',{cut:false,xray:0,explode:0},[-4.25,2.1,2.8],[-1.15,0,0]],['joint-mengtian-cut',{cut:true,xray:0,explode:0},[4.25,2.1,2.8],[1.15,0,0]],['joint-mengtian-xray',{cut:false,xray:.65,explode:0},[4.25,2.1,2.8],[1.15,0,0]],['joint-mengtian-exploded',{cut:false,xray:.25,explode:.18},[4.25,2.1,2.8],[1.15,0,0]]];
views.push(['joint-aft-solid',{cut:false,xray:0,explode:0},[4.7,2.9,16.9],[0,0,15.05]],['joint-aft-lower',{cut:false,xray:0,explode:0},[4.2,-2,16.5],[0,0,15.05]],['joint-aft-cut',{cut:true,xray:0,explode:0},[4.7,2.9,16.9],[0,0,15.05]],['joint-aft-exploded',{cut:false,xray:.25,explode:.18},[5.7,4.9,18.9],[0,0,15.05]]);
for(const [name,state,position,target] of views){
 await page.evaluate(({state,position,target})=>{const a=TIANGONG,T=a.stage; a.setState({...state,topic:'overview',labels:false,interior:false});a.setView('overview',true);T.planet.visible=false;T.scene.background.set(0x050a10);const c=T.camera,controls=T.controls;controls.enabled=false;controls.update=()=>{};c.fov=48;c.updateProjectionMatrix();c.position.set(...position);controls.target.set(...target);c.lookAt(...target);c.updateMatrixWorld(true);SIM.render(4);document.querySelector('.scene-heading').hidden=true;},{state,position,target});
 await page.locator('#gl').screenshot({path:`tiangong/captures/${name}.png`});
}
fs.writeFileSync('tiangong/connection-inspection.json',JSON.stringify({passed:errors.length===0,...result,errors},null,2));
console.log(JSON.stringify({passed:errors.length===0,...result,errors},null,2));
await browser.close();
