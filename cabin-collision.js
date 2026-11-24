import * as T from 'three';
import {hullRadius} from './model.js';

export const CAMERA_RADIUS=.12;
const CELL=.45,SKIN=.002;
// Static cabin geometry, assembled in metre space. Solar wings, ships and exterior
// mechanisms never enter this index. Grid queries retain the real triangle faces.
export function createCabinCollider(station,kind){
 const start=performance.now(),mod=station.modules[kind],grid=new Map(),vertices=[];
 station.root.updateMatrixWorld(true);
 const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),inverse=mod.matrixWorld.clone().invert(),world=mod.matrixWorld.clone();
 const key=(x,y,z)=>x+','+y+','+z;
 const owned=mod.children.filter(o=>o.name.endsWith('/ interior')||o.name.startsWith('生活区 /')||o.name==='天和前端舱壁与舱门'||o.name==='承压结构与设备服务层'||o.name.startsWith('问天 / 三个睡眠区')||o.name.startsWith('隔热与防护'));
 for(const root of owned)root.traverse(o=>{
  if(!o.isMesh)return;
  const g=o.geometry,p=g.attributes.position,idx=g.index,count=idx?idx.count:p.count;
  for(let i=0;i<count;i+=3){
   a.fromBufferAttribute(p,idx?idx.getX(i):i).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(p,idx?idx.getX(i+1):i+1).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(p,idx?idx.getX(i+2):i+2).applyMatrix4(o.matrixWorld);
   const id=vertices.length/9;vertices.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);
   const lx=Math.floor(Math.min(a.x,b.x,c.x)/CELL),hx=Math.floor(Math.max(a.x,b.x,c.x)/CELL),ly=Math.floor(Math.min(a.y,b.y,c.y)/CELL),hy=Math.floor(Math.max(a.y,b.y,c.y)/CELL),lz=Math.floor(Math.min(a.z,b.z,c.z)/CELL),hz=Math.floor(Math.max(a.z,b.z,c.z)/CELL);
   for(let x=lx;x<=hx;x++)for(let y=ly;y<=hy;y++)for(let z=lz;z<=hz;z++){const k=key(x,y,z);let bucket=grid.get(k);if(!bucket)grid.set(k,bucket=[]);bucket.push(id);}
  }
 });
 const data=new Float32Array(vertices),marks=new Uint32Array(vertices.length/9);let serial=0;
 const triangle=new T.Triangle(),closest=new T.Vector3(),normal=new T.Vector3(),local=new T.Vector3(),candidate=new T.Vector3(),before=new T.Vector3(),step=new T.Vector3();
 function query(p,r){
  serial++;if(serial===4294967295){marks.fill(0);serial=1;}const list=[];
  for(let x=Math.floor((p.x-r)/CELL);x<=Math.floor((p.x+r)/CELL);x++)for(let y=Math.floor((p.y-r)/CELL);y<=Math.floor((p.y+r)/CELL);y++)for(let z=Math.floor((p.z-r)/CELL);z<=Math.floor((p.z+r)/CELL);z++)for(const id of grid.get(key(x,y,z))||[]){if(marks[id]===serial)continue;marks[id]=serial;list.push(id);}
  return list;
 }
 function face(id){const k=id*9;triangle.a.fromArray(data,k);triangle.b.fromArray(data,k+3);triangle.c.fromArray(data,k+6);return triangle;}
 function distance(p,range=.5){let d=Infinity;for(const id of query(p,range)){face(id).closestPointToPoint(p,closest);d=Math.min(d,p.distanceTo(closest));}return d;}
 function envelope(p){
  local.copy(p).applyMatrix4(inverse);const lo=kind==='tianhe'?1.56:1.86,hi=kind==='tianhe'?13.36:9.78;
  local.z=T.MathUtils.clamp(local.z,lo,hi);const r=hullRadius(kind,local.z)-.055-CAMERA_RADIUS-SKIN,len=Math.hypot(local.x,local.y);if(len>r){local.x*=r/len;local.y*=r/len;}p.copy(local).applyMatrix4(world);
 }
 function move(position,delta){
  const n=Math.max(1,Math.ceil(delta.length()/(CAMERA_RADIUS*.35)));step.copy(delta).multiplyScalar(1/n);let hit=false;
  for(let s=0;s<n;s++){
   before.copy(position);candidate.copy(position).add(step);envelope(candidate);
   for(let iter=0;iter<5;iter++){
    let pushed=false;
    for(const id of query(candidate,CAMERA_RADIUS+SKIN)){
     face(id).closestPointToPoint(candidate,closest);const d=candidate.distanceTo(closest);if(d>=CAMERA_RADIUS+SKIN-1e-6)continue;
     if(d>1e-8)normal.copy(candidate).sub(closest).multiplyScalar(1/d);else{triangle.getNormal(normal);if(normal.dot(step)>0)normal.negate();}
     candidate.addScaledVector(normal,CAMERA_RADIUS+SKIN-d);pushed=true;hit=true;
    }
    envelope(candidate);if(!pushed)break;
   }
   if(distance(candidate,CAMERA_RADIUS+SKIN)<CAMERA_RADIUS-.0005){candidate.copy(before);hit=true;}
   if(candidate.distanceToSquared(before.clone().add(step))>1e-9)hit=true;
   position.copy(candidate);
  }
  return hit;
 }
 return {kind,move,distance,envelope,stats:{triangles:data.length/9,cells:grid.size,buildMilliseconds:Math.round(performance.now()-start),radius:CAMERA_RADIUS}};
}
