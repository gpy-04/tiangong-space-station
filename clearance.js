import * as T from 'three';
import {WALK_ROUTES} from './film.js';
import {hullRadius} from './model.js';
// Regression for the visible Earth leak at the sleeping aisle's forward end.
// Sample opaque geometry with front-sided rays, so inverted faces cannot pass.
export function auditTianheClosure(station){
 station.root.updateMatrixWorld(true);
 const mod=station.modules.tianhe,end=mod.getObjectByName('天和前端舱壁与舱门');
 if(!end)return {passed:false,reason:'Missing forward bulkhead assembly',rays:0};
 const meshes=[];end.traverse(o=>{if(o.isMesh&&o.material.opacity===1&&!o.material.transparent)meshes.push(o);});
 const ray=new T.Raycaster(),target=new T.Vector3(),direction=new T.Vector3(),failures=[];
 const observers=[[0,.4,1.85],[.28,-.35,2.1],[-.25,.65,2.35],[0,-.72,2.25],[0,0,1.12]];
 let rays=0,misses=0,minThickness=Infinity;
 for(const point of observers){
  const origin=mod.localToWorld(new T.Vector3(...point));
  for(let ring=0;ring<=14;ring++)for(let i=0;i<(ring?96:1);i++){
   const angle=i*Math.PI*2/96,r=1.275*ring/14;
   target.set(Math.cos(angle)*r,Math.sin(angle)*r,1.47);mod.localToWorld(target);
   direction.copy(target).sub(origin);const distance=direction.length();direction.divideScalar(distance);
   ray.set(origin,direction);ray.near=.00001;ray.far=distance+.3;rays++;
   if(!ray.intersectObjects(meshes,false).length){misses++;if(failures.length<12)failures.push({origin:point,target:mod.worldToLocal(target.clone()).toArray()});}
  }
 }
 // The closed door must occlude rays from both directions independently of the
 // surrounding node sphere; measure the two real faces rather than the datum.
 const door=end.getObjectByName('前端关闭舱门 / 连续实体门板');door.geometry.computeBoundingBox();minThickness=door.geometry.boundingBox.max.z-door.geometry.boundingBox.min.z;
 const threshold=end.getObjectByName('前端门槛与通道地板连接');threshold.geometry.computeBoundingBox();const floorEnd=threshold.geometry.boundingBox.clone().applyMatrix4(threshold.matrixWorld).max.z;
 return {passed:misses===0&&minThickness>.05&&Math.abs(floorEnd-1.66)<.001,rays,misses,failures,doorThickness:minThickness,thresholdToFirstFloorGap:1.66-floorEnd,observers,scope:'Opaque forward-end closure from four cabin positions and the reverse face; concentric rays cover the hatch, annular panel, lower sill and shell junction. Includes only the closure assembly, so the Earth, outer node and unrelated equipment cannot mask a missing face.'};
}
// Tests assembled, static geometry. Mounting contacts inside a fixture are intentional.
export function auditLivingClearance(station){
 station.root.updateMatrixWorld(true);
 const core=station.modules.tianhe,life=core.getObjectByName('生活区 / 睡眠 · 卫生 · 餐饮 · 锻炼');
 const fixtures=life.userData.fixtures,overlaps=[];
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  const a=fixtures[i],b=fixtures[j],extent=a.min.map((v,k)=>Math.min(a.max[k],b.max[k])-Math.max(v,b.min[k]));
  if(extent.every(v=>v>.003))overlaps.push({a:a.name,b:b.name,extent});
 }
 const profile=[[1.32,1.33],[1.34,1.48],[1.34,6.65],[1.38,6.78],[2.06,7.7],[2.1,7.88],[2.1,12.98],[2.02,13.22],[1.8,13.8],[1.55,14.8]];
 function insideRadius(z){for(let i=1;i<profile.length;i++)if(z<=profile[i][1]){const a=profile[i-1],b=profile[i];return a[0]+(b[0]-a[0])*(z-a[1])/(b[1]-a[1])-.075;}return profile.at(-1)[0]-.075;}
 const inv=core.matrixWorld.clone().invert(),v=new T.Vector3();let vertices=0,minHullGap=Infinity,worstHull='',outside=0;
 life.traverse(o=>{if(!o.isMesh)return;const transform=inv.clone().multiply(o.matrixWorld),p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(transform);const gap=insideRadius(v.z)-Math.hypot(v.x,v.y);vertices++;if(gap<minHullGap){minHullGap=gap;worstHull=o.name;}if(gap<-.002)outside++;}});
 const interiorHulls=[];
 for(const [kind,mod]of Object.entries(station.modules)){
  let checked=0,out=0,min=Infinity,worst='',worstPoint=[];const inverse=mod.matrixWorld.clone().invert();
  for(const child of mod.children.filter(o=>o.name.endsWith('/ interior')||o.name==='承压结构与设备服务层'||o.name==='问天 / 三个睡眠区与卫生区'))child.traverse(o=>{if(!o.isMesh)return;const tr=inverse.clone().multiply(o.matrixWorld),a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(tr);const gap=hullRadius(kind,v.z)-.055-Math.hypot(v.x,v.y);checked++;if(gap<min){min=gap;worst=o.name;worstPoint=v.toArray();}if(gap<-.002)out++;}});
  interiorHulls.push({kind,checkedVertices:checked,outsideVertices:out,minimumGap:min,worst,worstPoint});
 }
 const meshes=[];station.root.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();meshes.push({o,b:o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)});}});
 const triangle=new T.Triangle(),nearest=new T.Vector3(),p=new T.Vector3(),routes=[];
 for(const [name,ends]of Object.entries(WALK_ROUTES)){
  let distance=Infinity,worst='',at=0;
  for(let s=0;s<=60;s++){
   p.set(...ends[0]).lerp(new T.Vector3(...ends[1]),s/60);
   for(const {o,b}of meshes){if(b.distanceToPoint(p)>.60)continue;const g=o.geometry,a=g.attributes.position,idx=g.index,count=idx?idx.count:a.count;
    for(let k=0;k<count;k+=3){triangle.a.fromBufferAttribute(a,idx?idx.getX(k):k).applyMatrix4(o.matrixWorld);triangle.b.fromBufferAttribute(a,idx?idx.getX(k+1):k+1).applyMatrix4(o.matrixWorld);triangle.c.fromBufferAttribute(a,idx?idx.getX(k+2):k+2).applyMatrix4(o.matrixWorld);triangle.closestPointToPoint(p,nearest);const d=nearest.distanceTo(p);if(d<distance){distance=d;worst=o.name;at=s/60;}}
   }
  }
  routes.push({name,samples:61,minimumSurfaceDistance:distance,cameraRadius:.12,clearance:distance-.12,worst,at});
 }
 const bike=fixtures.find(f=>f.name.startsWith('功率自行车')),floorTop=-1.43+.075/2,bikeFloorGap=Math.abs(bike.min[1]-floorTop);
 return {passed:overlaps.length===0&&outside===0&&interiorHulls.every(h=>h.outsideVertices===0)&&routes.every(r=>r.clearance>=0)&&bikeFloorGap<.002,fixtureCount:fixtures.length,fixtures,unrelatedFixtureAabbOverlaps:overlaps,hull:{checkedVertices:vertices,minimumGap:minHullGap,outsideVertices:outside,worst:worstHull},interiorHulls,bikeFloorGap,routes,scope:'Assembled living fixtures; conservative pairwise AABBs, vertex hull-envelope checks for living fixtures and all three cabin interiors, 61 triangle-distance samples per authored camera route with 0.12 m radius. Intentional mounting/contact joints are excluded from fixture overlap comparisons. Not an engineering full-assembly collision certification.'};
}
