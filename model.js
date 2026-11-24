import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {M,labelMat,flagMat,rackFaceMat} from './materials.js';
import {RACKS,CONFIG} from './data.js';
import {createLivingArea} from './living.js';
import {LAB_FACILITIES} from './lab-data.js';
export const HULL_PROFILES={tianhe:[[1.32,1.33],[1.34,1.48],[1.34,6.65],[1.38,6.78],[2.06,7.7],[2.1,7.88],[2.1,12.98],[2.02,13.22],[1.8,13.8],[1.55,14.8]],wentian:[[.78,0],[.79,.5],[1.3,.8],[2.02,1.55],[2.1,1.75],[2.1,9.6],[2.03,9.85],[1.49,10.65],[1.48,15.7],[1.05,16.95],[.85,17.3]],mengtian:[[.78,0],[.79,.5],[1.3,.8],[2.02,1.55],[2.1,1.75],[2.1,9.6],[2.03,9.85],[1.49,10.65],[1.48,15.7],[1.05,16.95],[.85,17.3]]};
// End tapers share the exact shell end and spacecraft mating-plane datums.
HULL_PROFILES.tianhe.push([1.52,14.84],[1.34,14.90],[1.02,15.01],[.75,15.10]);
for(const kind of['wentian','mengtian'])HULL_PROFILES[kind].push([.85,17.40],[.83,17.50]);
export function hullRadius(kind,z){const p=HULL_PROFILES[kind];for(let i=1;i<p.length;i++)if(z<=p[i][1]){const a=p[i-1],b=p[i];return a[0]+(b[0]-a[0])*(z-a[1])/(b[1]-a[1]);}return p.at(-1)[0];}
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const gBox=new RoundedBoxGeometry(1,1,1,2,.035),gCyl=new T.CylinderGeometry(1,1,1,24),gSphere=new T.SphereGeometry(1,20,14);
export function group(p,name,pos=[0,0,0]){const g=new T.Group();g.name=name;g.position.set(...pos);p.add(g);return g;}
function mesh(p,geo,mat,name=''){let m=new T.Mesh(geo,mat);m.name=name;p.add(m);m.castShadow=true;m.receiveShadow=true;return m;}
function box(p,pos,size,mat=M.panel,name=''){const m=mesh(p,gBox,mat,name);m.position.set(...pos);m.scale.set(...size);return m;}
function cyl(p,pos,r,l,mat=M.silver,axis='z',name=''){let m=mesh(p,gCyl,mat,name);m.position.set(...pos);m.scale.set(r,l,r);if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=-Math.PI/2;return m;}
function sphere(p,pos,r,mat=M.gold){let m=mesh(p,gSphere,mat);m.position.set(...pos);m.scale.setScalar(r);return m;}
function portedSphere(p,r,holes,mat,name){
 const source=new T.SphereGeometry(r,256,192),pos=source.attributes.position,idx=source.index.array,positions=[],normals=[];
 const crossing=(a,b,h)=>{let lo=0,hi=1;for(let i=0;i<24;i++){const t=(lo+hi)/2,q=a.clone().lerp(b,t).normalize().multiplyScalar(r);if(q.dot(h.axis)>r*h.cos)hi=t;else lo=t;}return a.clone().lerp(b,(lo+hi)/2).normalize().multiplyScalar(r);};
 const append=(a,b,c)=>{for(const v of[a,b,c]){positions.push(v.x,v.y,v.z);const n=v.clone().normalize();normals.push(n.x,n.y,n.z);}};
 for(let i=0;i<idx.length;i+=3){let polygon=[0,1,2].map(j=>V(pos.getX(idx[i+j]),pos.getY(idx[i+j]),pos.getZ(idx[i+j])));for(const h of holes){const clipped=[];for(let j=0;j<polygon.length;j++){const a=polygon[j],b=polygon[(j+1)%polygon.length],insideA=a.dot(h.axis)<=r*h.cos,insideB=b.dot(h.axis)<=r*h.cos;if(insideA&&insideB)clipped.push(b);else if(insideA&&!insideB)clipped.push(crossing(a,b,h));else if(!insideA&&insideB)clipped.push(crossing(b,a,h),b);}polygon=clipped;if(polygon.length<3)break;}for(let j=1;j<polygon.length-1;j++)append(polygon[0],polygon[j],polygon[j+1]);}
 const uvs=[];for(let i=0;i<positions.length;i+=3){uvs.push((Math.atan2(positions[i+2],positions[i])+Math.PI)/(2*Math.PI),Math.acos(Math.max(-1,Math.min(1,positions[i+1]/r)))/Math.PI);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.computeBoundingSphere();const result=mesh(p,geometry,mat,name);result.userData.openPorts=holes.map(h=>({axis:h.axis.toArray(),cos:h.cos}));return result;
}
function coreNodeNeck(p){const start=1.48*.68,outer=Math.sqrt(1.48*1.48-start*start),profile=[[outer,start],[1.145,1.06],[1.23,1.15],[1.29,1.24],[1.32,1.33]],g=group(p,'天和与节点舱连续变径连接段');for(const [upper,angle]of[[true,0],[false,Math.PI]]){const part=mesh(g,shellGeo(profile,angle,Math.PI,.055),M.white,upper?'节点连接壳上半部':'节点连接壳下半部');part.userData.keep=true;}g.userData.contact={nodePlane:start,nodeRadius:outer,corePlane:1.33,coreRadius:1.32,wall:.055};return g;}
function ring(p,z,r,t,mat=M.silver){let m=mesh(p,new T.TorusGeometry(r,t,8,64),mat);m.position.z=z;return m;}
function portAdapter(port,endZ,endRadius,name){const nodePlane=1.2,nodeRadius=1.48,nodeMouth=Math.sqrt(nodeRadius*nodeRadius-nodePlane*nodePlane),wall=.055,stations=[[-nodePlane,nodeMouth],[-1.24,nodeMouth+.018],[-1.29,nodeMouth+.018],[-1.34,endRadius+.075],[-1.40,endRadius+.045],[endZ+.035,endRadius+.025],[endZ,endRadius]];const outer=stations.map(([z,r])=>[r,z]),inner=stations.slice().reverse().map(([z,r],i)=>[r-wall,z]);const section=[...outer,...inner,[outer[0][0],outer[0][1]]],adapter=mesh(port,new T.LatheGeometry(section.map(v=>new T.Vector2(...v)),96),M.silver,name);adapter.rotation.x=Math.PI/2;adapter.userData.interface={nodePlane:-nodePlane,nodeRadius:nodeMouth,matingPlane:endZ,outerRadius:endRadius,innerRadius:endRadius-wall,wall};return adapter;}
function link(p,a,b,r=.035,mat=M.silver){a=V(...a);b=V(...b);let d=b.clone().sub(a);let m=mesh(p,gCyl,mat);m.position.copy(a).add(b).multiplyScalar(.5);m.scale.set(r,d.length(),r);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;}
function tube(p,pts,r,mat=M.silver){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(a=>V(...a))),Math.max(12,pts.length*8),r,6,false),mat);}
function placard(p,title,sub,pos,rotation=[0,0,0],size=[.8,.4]){let m=mesh(p,new T.PlaneGeometry(...size),labelMat(title,sub));m.position.set(...pos);m.rotation.set(...rotation);return m;}
function hatch(p,z,r=.75,door=false){ring(p,z,r,.09);ring(p,z+.03,r-.1,.025,M.dark);for(let i=0;i<12;i++){let a=i*Math.PI/6;let b=box(p,[Math.sin(a)*(r+.12),Math.cos(a)*(r+.12),z],[.08,.08,.08],M.silver);b.rotation.z=-a;}if(door){cyl(p,[0,0,z],r-.1,.1,M.panel);box(p,[0,0,z-.07],[.6,.07,.05],M.silver);}}
function bulkhead(p,z,r=1.97){const shape=new T.Shape();shape.absarc(0,0,r,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,.86,0,Math.PI*2,true);shape.holes.push(hole);const g=new T.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,steps:1,curveSegments:48});let m=mesh(p,g,M.panel,'承压隔框');m.position.z=z-.045;}
function tianheForwardClosure(p){
 // +Z faces the sleeping aisle. This model closes the hatch because the node
 // interior is outside the navigable area. These are illustrative dimensions.
 const g=group(p,'天和前端舱壁与舱门');g.userData.topic='life';
 const front=1.39,back=1.55,aperture=.705,chamfer=.012,sealLap=.004;
 const outer=z=>hullRadius('tianhe',z)-.055+sealLap;
 // A closed revolved section, including the aperture return and both faces.
 // The outer land shares the hull datum; a 4 mm seating lap closes the seam.
 const contour=[
  [aperture,front+chamfer],[aperture+chamfer,front],
  [outer(front)-chamfer,front],[outer(front+chamfer),front+chamfer],
  [outer(back-chamfer),back-chamfer],[outer(back)-chamfer,back],
  [aperture+chamfer,back],[aperture,back-chamfer],[aperture,front+chamfer]
 ];
 const annulusGeo=new T.LatheGeometry(contour.map(v=>new T.Vector2(...v)),128);
 // sin(2π) is not exactly zero. Copy the first meridian so even rays lying on
 // the lower seam meet identical boundary positions, from either side.
 const ap=annulusGeo.attributes.position,an=annulusGeo.attributes.normal,rows=contour.length;
 for(let j=0;j<rows;j++){ap.setXYZ(128*rows+j,ap.getX(j),ap.getY(j),ap.getZ(j));an.setXYZ(128*rows+j,an.getX(j),an.getY(j),an.getZ(j));}
 const annulus=mesh(g,annulusGeo,M.panel,'前端连续环形封板 / 舱壳安装搭接');annulus.rotation.x=Math.PI/2;
 hatch(g,1.54,.78);
 const doorShape=new T.Shape();doorShape.absarc(0,0,aperture,0,Math.PI*2,false);
 const door=mesh(g,new T.ExtrudeGeometry(doorShape,{depth:.04,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3,steps:1,curveSegments:64}),M.panel,'前端关闭舱门 / 连续实体门板');door.position.z=1.522;
 for(const x of[-.15,.15])box(g,[x,.02,1.589],[.035,.045,.038],M.silver,'舱门手柄支座');
 box(g,[0,.02,1.616],[.36,.038,.028],M.silver,'舱内侧手柄');
 box(g,[0,-.96,1.605],[.78,.045,.11],M.panel,'前端门槛与通道地板连接');
 g.userData.closure={front,back,aperture,shellThickness:.055,sealLap,closedHatch:true};
 return g;
}
function evaDeck(p){const s=new T.Shape();s.moveTo(-1.625,-2.35);s.lineTo(1.625,-2.35);s.lineTo(1.625,2.35);s.lineTo(-1.625,2.35);s.closePath();const h=new T.Path();h.absarc(0,.7,.64,0,Math.PI*2,true);s.holes.push(h);const g=new T.ExtrudeGeometry(s,{depth:.1,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:48});const m=mesh(p,g,M.white,'带真实出舱开口的外层板');m.rotation.x=Math.PI/2;m.position.set(0,1.72,12.8);}
// A closed, thick annular sector revolved from paired outer/inner profiles.
// Each half is separately owned, so teardown does not fake an opening with a decal.
function shellGeo(profile,start,arc,thick=.055){const covered=profile.at(-1)[1]-profile[0][1]>4;if(covered){let dense=[];for(let j=0;j<profile.length-1;j++){const a=profile[j],b=profile[j+1],steps=Math.max(1,Math.ceil((b[1]-a[1])/.18));for(let k=0;k<steps;k++){let t=k/steps;dense.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}dense.push(profile.at(-1));profile=dense;}
 const n=covered?128:64,rows=profile.length,positions=[],uv=[],indices=[];for(let side=0;side<2;side++)for(let j=0;j<rows;j++){let [r,z]=profile[j];r-=side*thick;for(let i=0;i<=n;i++){let a=start+arc*i/n,rr=r;if(covered&&!side){const patches=Math.abs(Math.sin(z*Math.PI/1.2))*Math.pow(Math.abs(Math.sin(a*7)),.65);rr-=.016*patches;rr+=.004*Math.sin(a*31+z*9)*Math.sin(z*4);}positions.push(Math.cos(a)*rr,Math.sin(a)*rr,z);uv.push(a*r/2,z/2);}}
 const row=n+1,off=rows*row;function q(a,b,c,d,flip=false){if(flip)indices.push(a,c,b,a,d,c);else indices.push(a,b,c,a,c,d);}
 for(let j=0;j<rows-1;j++)for(let i=0;i<n;i++){let a=j*row+i;q(a,a+1,a+1+row,a+row);a+=off;q(a,a+1,a+1+row,a+row,true);}
 for(let j of [0,rows-1])for(let i=0;i<n;i++){let a=j*row+i;q(a,a+off,a+off+1,a+1,j===0);}
 for(let i of [0,n])for(let j=0;j<rows-1;j++){let a=j*row+i;q(a,a+row,a+row+off,a+off,i===0);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;}
function optimize(p){p.updateMatrix();const buckets=new Map();for(const m of [...p.children])if(m.isMesh&&!m.userData.keep){m.updateMatrix();let a=buckets.get(m.material)||[];a.push(m);buckets.set(m.material,a);}for(const [mat,list]of buckets){if(list.length<2)continue;let gs=list.map(m=>{let g=m.geometry.clone();if(g.index)g=g.toNonIndexed();g.applyMatrix4(m.matrix);return g;});const merged=mergeGeometries(gs);if(!merged)throw Error('Geometry merge failed: '+p.name);let m=mesh(p,merged,mat,p.name+' / '+mat.uuid.slice(0,4));for(const o of list)p.remove(o);gs.forEach(g=>g.dispose());}}
function rack(p,z,side,title,code,type=0){const root=group(p,title,[side*1.31,-.02,z]);root.userData={topic:p.userData.topic,detail:title,rack:true,baseX:side*1.31,side,labFacility:LAB_FACILITIES.find(d=>d.module===p.userData.topic&&d.code===code)?.id};root.rotation.y=side<0?Math.PI/2:-Math.PI/2;
 box(root,[0,0,0],[1.02,2.33,.49],M.dark);box(root,[0,0,.26],[.95,2.24,.055],M.panel);const face=mesh(root,new T.PlaneGeometry(.95,2.24),rackFaceMat(title,code,type));face.position.z=.289;for(let x of[-.48,.48]){box(root,[x,0,.29],[.018,2.3,.045],M.silver);for(let y of[-1.02,-.7,0,.72,1.02]){cyl(root,[x,y,.33],.015,.018,M.dark);}}
 // Folded green handles, latches and interface plates stand clear of the face.
 for(let x of[-.36,.36])for(let y of[-.97,.73]){box(root,[x,y,.32],[.1,.035,.04],M.green);box(root,[x+.03,y+.025,.34],[.025,.045,.025],M.silver);}
 for(let i=0;i<4;i++){box(root,[-.34+i*.22,-.62,.33],[.1,.065,.055],M.silver);cyl(root,[-.34+i*.22,-.62,.375],.025,.015,M.dark);}
 if(type%2===0){tube(root,[[-.3,.62,.36],[-.26,.47,.48],[.25,.4,.47],[.29,.22,.36]],.008,M.dark);tube(root,[[-.32,-.2,.36],[-.2,-.3,.46],[.2,-.18,.43],[.3,-.4,.36]],.008,M.blue);}
 for(let y of [-.92,-.36,.31]){box(root,[0,y,.3],[.86,.028,.028],M.silver);for(let x of[-.41,.41]){for(let yy=0;yy<4;yy++)cyl(root,[x,y+yy*.12,.34],.014,.016,M.dark);}}
 for(let x of[-.39,.39]){link(root,[x,-.72,.355],[x,-.25,.355],.022,M.silver);link(root,[x,-.72,.355],[x,-.72,.3],.021);link(root,[x,-.25,.355],[x,-.25,.3],.021);}
 // Match recognizable functions to their own cabinet. Repeating a glovebox on
 // every fourth rack would teach the wrong relationship between label and form.
 const faceMode=({EC:0,BTR:3,VGR:2,GLOVE:1,CRYO:4,FLUID:2,'TWO-PHASE':2,COMB:0,MAT:5,COLD:5,'TIME I':3,'TIME II':3,SERVICE:6,ECLSS:2,CDMS:3,EPS:0,PAYLOAD:3,UTILITY:2})[code]??type%4;
 if(faceMode===0){for(let x of[-.24,.24]){box(root,[x,.2,.32],[.32,.37,.04],M.blue);box(root,[x,.2,.345],[.25,.28,.028],M.glass);}for(let i=0;i<6;i++)cyl(root,[-.32+i*.13,.57,.33],.025,.035,i%2?M.dark:M.orange);}
 if(faceMode===1){box(root,[0,.14,.34],[.79,.61,.06],M.silver);box(root,[0,.14,.38],[.69,.49,.02],M.glass);for(let x of[-.17,.17]){cyl(root,[x,.13,.425],.105,.07,M.rubber);sphere(root,[x,.13,.46],.085,M.fabric);}for(let x of[-.34,.34])for(let y of[-.08,.36])cyl(root,[x,y,.405],.015,.02,M.silver);}
 if(faceMode===2){for(let x of[-.25,0,.25])for(let y of[-.45,.0,.45]){cyl(root,[x,y,.33],.045,.04,M.dark);cyl(root,[x,y,.365],.02,.03,M.silver);}tube(root,[[-.25,.45,.4],[-.25,.2,.55],[.25,.05,.55],[.25,-.45,.4]],.017,M.panel);}
 if(faceMode===3){box(root,[0,.24,.35],[.7,.43,.05],M.screen);placard(root,'NOMINAL','SYSTEM READY',[0,.24,.38],[0,0,0],[.63,.34]);for(let y of[-.45,-.65])for(let i=0;i<9;i++)box(root,[-.34+i*.085,y,.34],[.045,.1,.02],M.dark);}
 if(faceMode===4){for(const [i,temp]of['+4 °C','−20 °C','−80 °C'].entries()){const y=.49-i*.48;box(root,[0,y,.33],[.75,.40,.06],M.panel);link(root,[.19,y-.09,.39],[.19,y+.09,.39],.016,M.green);placard(root,temp,'STORAGE',[0,y,.365],[0,0,0],[.32,.19]);}}
 if(faceMode===5){box(root,[0,.05,.34],[.77,.99,.065],M.silver);for(const y of[-.27,.06,.39]){box(root,[0,y,.38],[.66,.24,.035],M.panel);for(const x of[-.24,.24])cyl(root,[x,y,.41],.017,.025,M.dark);}placard(root,code==='MAT'?'材料实验单元':'原子物理单元','EXPERIMENT UNIT',[0,.71,.34],[0,0,0],[.72,.22]);}
 if(faceMode===6){box(root,[0,.08,.34],[.75,.87,.06],M.silver);box(root,[0,.08,.38],[.65,.74,.025],M.dark);for(const x of[-.20,0,.20]){link(root,[x,-.17,.42],[x,.28,.42],.017,M.silver);for(const y of[-.10,.20])box(root,[x,y,.44],[.10,.035,.035],M.green);}placard(root,'装调试验区','SERVICE TEST',[0,.69,.34],[0,0,0],[.72,.22]);}
 root.userData.keep=true;optimize(root);return root;}
function cabin(p,kind){const room=group(p,kind+' / interior');room.userData.topic=kind;const start=kind==='tianhe'?7.8:2.0,end=kind==='tianhe'?13.2:9.7;
 for(let z=start+.385;z<end;z+=.8){const floorR=Math.min(hullRadius(kind,z-.385),hullRadius(kind,z+.385))-.075;const floorWidth=Math.min(2.5,2*Math.sqrt(Math.max(0,floorR*floorR-1.468*1.468))-.04);box(room,[0,-1.43,z],[floorWidth,.075,.77],M.panel);for(let x of[-1,1]){box(room,[x,-1.38,z],[.045,.022,.58],M.dark);link(room,[x*.73,-1.34,z-.2],[x*.73,-1.34,z+.2],.018,M.silver);}}
 for(let s of[-1,1]){box(room,[s*1.61,0,(start+end)/2],[.06,2.08,end-start],M.panel);for(let z=start;z<end;z+=1.1){link(room,[s*1.61,1.06,z],[s*1.61,1.06,z+.55],.023,M.blue);}box(room,[s*1.26,1.35,(start+end)/2],[.22,.05,end-start],M.light);}
 if(kind!=='tianhe'){RACKS[kind].forEach((a,i)=>rack(room,start+.65+Math.floor(i/2)*(kind==='wentian'?1.29:1.63),i%2?-1:1,a[0],a[1],i));if(kind==='wentian'){rack(room,6.5,1,'实验机位','PAYLOAD',3);rack(room,6.5,-1,'载荷保障机位','UTILITY',2);}}
 else{rack(room,8.5,1,'再生环境控制','ECLSS',2);rack(room,10,1,'测控与数据管理','CDMS',3);rack(room,11.5,1,'电源与配电','EPS',0);}
 for(let z of[start-.3,end+.3]){hatch(room,z,.82);bulkhead(room,z,Math.min(1.97,Math.min(hullRadius(kind,z-.065),hullRadius(kind,z+.065))-.10));}
 // Structural frames and service runs are physically inside the outer shell.
 const structure=group(p,'承压结构与设备服务层');structure.userData.topic=kind;
 for(let z=start;z<end;z+=1.1){ring(structure,z,1.96,.025,M.silver);}
 for(let s of[-1,1]){tube(structure,[[s*.9,-1.66,start],[s*.9,-1.66,end]],.045,M.silver);tube(structure,[[s*1.05,-1.58,start],[s*1.05,-1.58,end]],.018,M.blue);for(let z=start;z<end;z+=.7)box(structure,[s*.9,-1.66,z],[.18,.09,.07],M.dark);}
 optimize(structure);
 if(kind==='wentian'){const living=group(p,'问天 / 三个睡眠区与卫生区');living.userData.topic='wentian';for(let [side,z]of[[-1,7.85],[-1,8.95],[1,8.95]]){box(living,[side*1.29,0,z],[.59,2.12,.99],M.panel);box(living,[side*.96,0,z],[.04,1.86,.84],M.dark);box(living,[side*.92,-.04,z],[.05,1.65,.71],M.fabric);for(let y of[-.5,.15])box(living,[side*.88,y,z],[.02,.06,.72],M.rubber);box(living,[side*.87,.62,z],[.05,.25,.58],M.panel);placard(living,'睡眠区','CREW BERTH',[side*.91,.86,z],[0,side<0?Math.PI/2:-Math.PI/2,0],[.7,.22]);}box(living,[1.2,-.15,7.85],[.75,1.6,.93],M.panel);cyl(living,[1.0,.18,7.85],.19,.14,M.panel,'y');cyl(living,[1.0,.26,7.85],.13,.025,M.dark,'y');placard(living,'卫生区','HYGIENE',[.78,.73,7.85],[0,-Math.PI/2,0],[.65,.2]);optimize(living);}
 optimize(room);return room;}
function lifeArea(p){return createLivingArea(p,{group,mesh,box,cyl,link,tube,placard,optimize});}
function radiator(p,z,r,len=3.8){for(let s of[-1,1]){const g=group(p,'外部散热面',[s*r*.72,r*.69,z]);g.rotation.z=-s*Math.PI/4;box(g,[0,0,0],[1.18,.085,len],M.panel);for(let i=0;i<10;i++)box(g,[-.52+i*.115,.049,0],[.014,.01,len-.1],M.silver);optimize(g);}}
function dish(p,pos,r=.42){const g=group(p,'通信天线',pos);let pts=[];for(let i=0;i<=20;i++){let x=r*i/20;pts.push(new T.Vector2(x,x*x/(1.5*r)));}let m=mesh(g,new T.LatheGeometry(pts,40),M.panel);m.material.side=T.DoubleSide;m.rotation.x=Math.PI;link(g,[0,-.05,0],[0,-.5,0],.05);for(let i=0;i<3;i++){let a=i*Math.PI*2/3;link(g,[Math.cos(a)*r,-r*.65,Math.sin(a)*r],[0,-r*.85,0],.012);}return g;}
function solarWing(p,z,side,len,width,large=true){const anchor=group(p,'太阳翼转动根部',[side*1.6,0,z]);anchor.rotation.z=side<0?Math.PI:0;cyl(anchor,[.28,0,0],.28,.65,M.silver,'x');const wing=group(anchor,'柔性太阳翼',[.6,0,0]);const pieces=large?8:5,segment=len/pieces;
 for(let b=0;b<2;b++){const zoff=(b===0?-1:1)*(width/4+.12);for(let j=0;j<pieces;j++){const slab=mesh(wing,new T.BoxGeometry(segment-.045,.026,width/2-.1),M.solar,'电池毯面');slab.position.set(segment*(j+.5),0,zoff);slab.geometry.attributes.uv.array.forEach((v,i,arr)=>{arr[i]=v*(i%2?2:4);});for(let k of[-1,1])link(wing,[j*segment,-.045,zoff+k*(width/4-.05)],[(j+1)*segment,-.045,zoff+k*(width/4-.05)],.018,M.orange);}}
 for(let x=0;x<=len;x+=segment){for(let zSide of[-1,1]){link(wing,[x,-.06,zSide*.14],[x,.09,zSide*.14],.015,M.silver);}if(x+segment<=len){link(wing,[x,-.06,-.14],[x+segment,.09,.14],.019);link(wing,[x,.09,.14],[x+segment,-.06,-.14],.019);}}
 link(wing,[0,-.05,0],[len,-.05,0],.045,M.silver);box(wing,[len,.01,0],[.09,.19,width+.2],M.silver);optimize(wing);return {anchor,wing,len,width,pieces,side};}
function arm(p,length,pos,name){const root=group(p,name,pos);const a=group(root,'肩关节');cyl(a,[0,0,0],.25,.47,M.silver,'y');const upper=group(a,'上臂');link(upper,[0,0,0],[0,0,length*.51],.13,M.panel);for(let z of[.15,length*.51-.15])cyl(upper,[0,0,z],.18,.22,M.dark);const elbow=group(upper,'肘关节',[0,0,length*.51]);cyl(elbow,[0,0,0],.22,.36,M.silver,'x');link(elbow,[0,0,0],[0,0,length*.49],.1,M.panel);const hand=group(elbow,'末端执行器',[0,0,length*.49]);cyl(hand,[0,0,0],.19,.31,M.dark);for(let i=0;i<3;i++){let a=i*Math.PI*2/3;link(hand,[Math.cos(a)*.15,Math.sin(a)*.15,.1],[Math.cos(a)*.25,Math.sin(a)*.25,.28],.035,M.silver);}optimize(upper);optimize(elbow);optimize(hand);return {root,a,elbow};}
export function createStation(){const root=new T.Group();root.name='中国空间站 / 2023年10月30日外形基准';const modules={},shells=[],wings=[],arms=[],details=[],exteriors=[];
 for(const kind of['tianhe','wentian','mengtian']){const mod=group(root,kind==='tianhe'?'天和核心舱':kind==='wentian'?'问天实验舱':'梦天实验舱');mod.userData.topic=kind;modules[kind]=mod;
 if(kind!=='tianhe'){mod.position.x=kind==='wentian'?-1.48:1.48;mod.rotation.y=kind==='wentian'?-Math.PI/2:Math.PI/2;}
 const isCore=kind==='tianhe';const profile=HULL_PROFILES[kind];
 const top=group(mod,'隔热与防护上半壳');top.userData.topic=isCore?'tianhe':kind;const bottom=group(mod,'隔热与防护下半壳');
 for(let [half,a]of[[top,0],[bottom,Math.PI]]){const hull=mesh(half,shellGeo(profile,a,Math.PI),M.white,'多层隔热与防护壳');for(let [r,z]of profile){if(z<1.5||z>13){const tor=mesh(half,new T.TorusGeometry(r+.025,.024,6,32,Math.PI),M.silver);tor.rotation.z=a;tor.position.z=z;}}
 if(half===top){const st=isCore?7.8:2.0,en=isCore?13.2:9.7;for(let z=st;z<en;z+=.77)for(let x of[-.8,0,.8]){box(half,[x,1.47,z],[.775,.045,.74],M.panel);for(let s of[-1,1]){cyl(half,[x+s*.31,1.438,z-.28],.014,.012,M.dark,'y');cyl(half,[x+s*.31,1.438,z+.28],.014,.012,M.dark,'y');}if(Math.abs(x)<.1){box(half,[x,1.435,z],[.38,.015,.13],M.silver);for(let q=0;q<6;q++)box(half,[x-.14+q*.055,1.424,z],[.018,.012,.08],M.dark);}else{link(half,[x-.16,1.42,z],[x+.16,1.42,z],.015,M.green);}}
 }
 optimize(half);const wires=new T.LineSegments(new T.EdgesGeometry(hull.geometry,32),new T.LineBasicMaterial({color:0x96b6c9,transparent:true,opacity:.26,depthWrite:false}));wires.name='透视结构轮廓';wires.visible=false;half.add(wires);shells.push({group:half,upper:half===top,kind,wires});}
 const equip=group(mod,'外部附属设备');equip.userData.topic=kind;exteriors.push(equip);for(let z of(isCore?[2.1,3.6,5.1,8.2,9.8,11.4,12.8]:[2.3,3.9,5.5,7.1,8.7,11.4,13.4,15.3])){let r=isCore?(z<6.7?1.36:2.11):(z<10?2.11:1.5);for(let s of[-1,1]){tube(equip,[[s*r*.88,r*.48,z-.3],[s*(r+.1),r*.55,z-.3],[s*(r+.1),r*.55,z+.3],[s*r*.88,r*.48,z+.3]],.025,M.orange);}}
 // Resource section blankets, cable harnesses, camera heads and thruster clusters.
 const resZ=isCore?13.8:15.7,resR=isCore?1.82:1.5;for(let s of[-1,1]){const blanket=group(equip,'资源舱隔热包覆',[s*.8,1.12,resZ]);box(blanket,[0,0,0],[.6,.31,.9],M.gold);box(blanket,[0,.18,0],[.33,.09,.4],M.dark);cyl(blanket,[0,.23,.08],.1,.11,M.silver,'y');for(let i=0;i<4;i++)cyl(blanket,[-.2+i*.13,.17,-.37],.018,.02,M.silver,'y');optimize(blanket);
 const cluster=group(equip,'姿控发动机组件',[s*resR,.25,resZ+.7]);for(let q of[-1,1]){const noz=mesh(cluster,new T.ConeGeometry(.12,.26,20,1,true),M.dark);noz.position.set(s*.13,q*.16,0);noz.rotation.z=s*Math.PI/2;link(cluster,[0,q*.16,0],[s*.3,q*.16,0],.04,M.silver);}optimize(cluster);
 tube(equip,[[s*.9,1.13,resZ-.7],[s*.95,1.19,resZ-.5],[s*1.05,1.22,resZ+.25]],.023,M.dark);
 }
 for(let j=0;j<5;j++){let z=(isCore?8.15:2.1)+j*.89;box(equip,[-1.24,1.65,z],[.33,.085,.6],M.panel);for(let k of[-1,1])cyl(equip,[-1.24+k*.11,1.697,z-.2],.014,.014,M.silver,'y');}
 radiator(equip,isCore?10.4:6.3,isCore?2.1:2.1,isCore?3.9:5.8);for(let z of(isCore?[3.2,5.8,13.5]:[2.1,9.3,14.4])){let r=isCore&&z<7?1.4:2.12;box(equip,[0,r+.04,z],[.66,.17,.5],M.gold);}
 hatch(equip,isCore?15.1:17.5,isCore?.75:.83,true);if(isCore)tianheForwardClosure(mod);
 const mark=mesh(equip,new T.PlaneGeometry(.95,.48),flagMat);mark.position.set(0,2.16,isCore?9.8:4);mark.rotation.x=-Math.PI/2;placard(equip,isCore?'中国空间站':kind==='wentian'?'问天':'梦天','CHINA SPACE STATION',[0,2.165,isCore?10.65:4.85],[-Math.PI/2,0,0],[1.25,.45]);
 dish(equip,[isCore?1.4:1.15,1.55,isCore?5.8:12]);
 if(isCore){for(let s of[-1,1])wings.push(solarWing(mod,5.5,s,10.5,3.25,false));arms.push(arm(mod,10.2,[1.35,.55,3.2],'核心舱机械臂'));lifeArea(mod);}else{for(let s of[-1,1])wings.push(solarWing(mod,16.65,s,25.6,4.45,true));if(kind==='wentian'){arms.push(arm(mod,5,[0,1.55,12.9],'问天小机械臂'));const exit=group(equip,'航天员气闸出舱口',[0,0,13.5]);exit.rotation.x=-Math.PI/2;hatch(exit,1.73,.53,true);}else{box(equip,[0,1.53,12.5],[1.38,.13,2.2],M.panel);for(let s of[-1,1])link(equip,[s*.57,1.62,11.6],[s*.57,1.62,13.3],.035);}}
 if(kind==='wentian'){const envelope=group(equip,'气闸舱 / 外方内圆与舱外载荷位');for(let side of[-1,1]){if(side<0)box(envelope,[0,side*1.62,12.8],[3.25,.11,4.7],M.white);else evaDeck(envelope);box(envelope,[side*1.62,0,12.8],[.11,3.25,4.7],M.white);}for(let side of[-1,1])for(let axis of[0,1])for(let i=0;i<(axis===0?7:4);i++){let z=10.9+i*(axis===0?.63:1.2);if(axis===0){box(envelope,[.65,side*1.7,z],[.28,.075,.29],M.silver);cyl(envelope,[.65,side*1.75,z],.07,.035,M.dark,'y');}else{box(envelope,[side*1.7,.65,z],[.075,.28,.29],M.silver);cyl(envelope,[side*1.75,.65,z],.07,.035,M.dark,'x');}}for(let s of[-1,1])for(let t of[-1,1])link(envelope,[s*1.61,t*1.61,10.4],[s*1.61,t*1.61,15.2],.026,M.silver);optimize(envelope);}
 const room=cabin(mod,kind);details.push(...room.children.filter(x=>x.isGroup));optimize(equip);}
 const node=group(modules.tianhe,'节点舱');node.userData.topic='tianhe';const portDirections=[V(-1,0,0),V(1,0,0),V(0,0,-1),V(0,-1,0),V(0,0,1)];portedSphere(node,1.48,portDirections.map((axis,i)=>({axis,cos:i===4?.68:i===3?.80:.811})),M.white,'节点舱球形承压壳 / 五处接口开孔');const coreNeck=coreNodeNeck(modules.tianhe);for(let i=0;i<2;i++)shells.push({group:coreNeck.children[i],upper:i===0,kind:'tianhe',wires:{visible:false}});
 for(let a of[0,Math.PI/2,-Math.PI/2]){const port=group(node,'节点对接口');port.rotation.y=a;const axial=Math.abs(a)<.1,endZ=axial?-1.72:-1.48,endRadius=axial?.72:.78;portAdapter(port,endZ,endRadius,axial?'轴向对接压力过渡段':'侧向对接压力过渡段 / 与实验舱承压壳齐平');hatch(port,endZ,endRadius);}
 const nadir=group(node,'径向对接口');nadir.rotation.x=-Math.PI/2;portAdapter(nadir,-1.48,.75,'天底端口压力过渡段');hatch(nadir,-1.48,.75,true);for(let a of[-.75,.75]){const window=group(node,'节点观察窗',[Math.sin(a)*1.1,1.0,Math.cos(a)*.65]);window.rotation.x=-Math.PI/3;ring(window,0,.19,.036);cyl(window,[0,0,.015],.16,.025,M.glass);}optimize(node);
 const ships=group(root,'来访飞行器');ships.userData.topic='docking';const sz=group(ships,'神舟载人飞船',[0,0,-1.72]);sz.rotation.y=Math.PI;const szProfile=[[.72,0],[1.12,.65],[1.12,2.1],[1.22,2.38],[1.25,3.3],[.9,4.2],[1.28,4.5],[1.28,6.1],[.75,6.6]];mesh(sz,shellGeo(szProfile,0,Math.PI*2,.045),M.white);ring(sz,2.3,1.18,.04,M.gold);const returnCapsule=mesh(sz,new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(1.15,.15),new T.Vector2(1.23,.9),new T.Vector2(.86,1.7),new T.Vector2(.66,1.8)],48),M.silver);returnCapsule.rotation.x=Math.PI/2;returnCapsule.position.z=4.1;for(let s of[-1,1]){const w=group(sz,'神舟太阳翼',[s*1.3,0,5.2]);box(w,[s*1.6,0,0],[3.2,.04,1.65],M.solar);for(let x=0;x<4;x++)link(w,[s*x*.8,0,-.84],[s*x*.8,0,.84],.025);}optimize(sz);
 const tz=group(ships,'天舟货运飞船',[0,0,15.1]);mesh(tz,shellGeo([[.75,0],[1.65,.85],[1.65,5.8],[1.3,6.3],[1.25,8.9]],0,Math.PI*2),M.white);for(let z of[1,5.7,6.3,8.6])ring(tz,z,z<6?1.66:1.26,.035,M.silver);for(let s of[-1,1]){box(tz,[s*2.85,0,6.9],[3.2,.035,2.2],M.solar);link(tz,[s*1.2,0,6.9],[s*4.45,0,6.9],.04);}cyl(tz,[0,0,8.9],1.23,.06,M.gold);for(let a=0;a<Math.PI*2;a+=Math.PI/2){let x=Math.cos(a)*.65,y=Math.sin(a)*.65;cyl(tz,[x,y,8.99],.18,.15,M.silver);const nozzle=mesh(tz,new T.CylinderGeometry(.24,.12,.27,24,1,true),M.dark);nozzle.rotation.x=Math.PI/2;nozzle.position.set(x,y,9.18);}optimize(tz);
 cyl(sz,[0,0,6.6],.75,.08,M.gold);const szNozzle=mesh(sz,new T.CylinderGeometry(.28,.13,.35,24,1,true),M.dark);szNozzle.rotation.x=Math.PI/2;szNozzle.position.z=6.8;optimize(sz);
 const endpoints=[{id:'tianhe',title:'天和 · 核心舱',pos:[0,2.2,9]},{id:'wentian',title:'问天 · 实验舱',pos:[-8,2,0]},{id:'mengtian',title:'梦天 · 实验舱',pos:[8,2,0]},{id:'life',title:'独立睡眠区',pos:[-1,1.8,4]},{id:'power',title:'柔性太阳翼',pos:[-18,0,14]},{id:'arm',title:'核心舱机械臂',pos:[3,3,7]}];
 const offsets={tianhe:V(0,0,5),wentian:V(-9,0,-3),mengtian:V(9,0,-3)};const bases=Object.fromEntries(Object.entries(modules).map(([k,g])=>[k,g.position.clone()]));const hullMaterials=new Map(),extMaterials=new Map(),ghosts=new Map(),faded=new Map();for(const s of shells)s.group.traverse(m=>{if(m.isMesh){hullMaterials.set(m,m.material);ghosts.set(m,new T.MeshBasicMaterial({color:0x84abc2,transparent:true,opacity:.09,depthWrite:false,side:T.DoubleSide}));}});
 for(const e of exteriors)e.traverse(m=>{if(m.isMesh){extMaterials.set(m,m.material);const f=m.material.clone();f.transparent=true;f.opacity=.18;f.depthWrite=false;faded.set(m,f);}});
 const rackObjects=[];root.traverse(o=>{if(o.userData.rack)rackObjects.push(o);});
 const assemblyLines=group(root,'拆解连接关系');for(let k of Object.keys(modules)){let points=[];const a=bases[k],b=a.clone().addScaledVector(offsets[k],1);points.push(a,b);const l=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineDashedMaterial({color:0xb6cad7,dashSize:.25,gapSize:.2,transparent:true,opacity:.45}));l.computeLineDistances();assemblyLines.add(l);}assemblyLines.visible=false;
 // Geometry is unchanged. Cache assembly states and update only transforms
 // that actually move; the revision also invalidates the shadow caches.
 const moduleEntries=Object.entries(modules),moduleKeys=Object.keys(modules),zero=V(),sunDirection=V(35,58,32).normalize(),scratchQ=new T.Quaternion(),scratchV=V();
 const cache={};let revision=0;
 root.updateMatrixWorld(true);
 for(const w of wings){scratchV.copy(sunDirection).applyQuaternion(w.anchor.parent.getWorldQuaternion(scratchQ).invert());w.trackingAngle=Math.atan2(w.side*scratchV.z,w.side*scratchV.y);}
 root.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});
 function pose(state,t){
  const e=state.explode||0,xray=state.xray||0,cut=!!state.cut,wire=!!state.wire,track=!!state.track,deploy=state.deploy??1,armMoving=!!state.arm,dockMoving=!!state.dock,showShips=state.ships!==false;
  let changed=false;
  if(cache.e!==e||cache.xray!==xray||cache.cut!==cut||cache.wire!==wire){
   for(const [k,g]of moduleEntries){g.position.copy(bases[k]).addScaledVector(offsets[k],e);g.updateMatrix();}
   for(const s of shells){s.group.position.y=e*(s.upper?5.2:-3.2);s.group.updateMatrix();s.group.visible=!(cut&&s.upper);s.wires.visible=xray>.2;s.group.traverse(m=>{if(m.isMesh){m.material=xray>.02?ghosts.get(m):hullMaterials.get(m);if(xray>.02)m.material.opacity=(1-xray)*.55+.025;m.renderOrder=xray>.02?2:0;m.material.wireframe=wire;}});}
   for(const [m,mat]of extMaterials)m.material=xray>.35||cut?faded.get(m):mat;
   for(const r of rackObjects){r.position.x=r.userData.baseX+r.userData.side*e*1.4;r.updateMatrix();}
   assemblyLines.visible=e>.1;
   assemblyLines.children.forEach((l,i)=>{const k=moduleKeys[i],a=k==='tianhe'?zero:modules.tianhe.position,b=modules[k].position,ar=l.geometry.attributes.position;ar.setXYZ(0,a.x,a.y,a.z);ar.setXYZ(1,b.x,b.y,b.z);ar.needsUpdate=true;l.computeLineDistances();});
   Object.assign(cache,{e,xray,cut,wire});changed=true;
  }
  if(cache.track!==track||cache.deploy!==deploy||(!track&&cache.wingTime!==t)){
   for(const w of wings){w.anchor.rotation.x=track?w.trackingAngle:Math.sin(t*.055)*.65;w.anchor.updateMatrix();w.wing.scale.x=Math.max(.018,deploy);w.wing.updateMatrix();}
   Object.assign(cache,{track,deploy,wingTime:t});changed=true;
  }
  if(cache.arm!==armMoving||(armMoving&&cache.armTime!==t)){
   arms.forEach((a,i)=>{a.a.rotation.y=(i?-.55:.5)+(armMoving?Math.sin(t*.3)*.25:0);a.a.rotation.x=-.3;a.a.updateMatrix();a.elbow.rotation.y=i?1.5:1.65;a.elbow.updateMatrix();});
   cache.arm=armMoving;cache.armTime=t;changed=true;
  }
  if(cache.dock!==dockMoving||cache.showShips!==showShips||cache.shipExplode!==e||(dockMoving&&cache.dockTime!==t)){
   const clearance=e*8+(dockMoving?(1-Math.min(1,(t%12)/7))*8:0),coreShift=modules.tianhe.position.z;
   ships.position.z=0;ships.updateMatrix();sz.position.z=-1.72+coreShift-clearance;tz.position.z=15.1+coreShift+clearance;sz.updateMatrix();tz.updateMatrix();ships.visible=showShips;
   Object.assign(cache,{dock:dockMoving,showShips,shipExplode:e,dockTime:t});changed=true;
  }
  if(changed){root.updateMatrixWorld(true);revision++;}
  return revision;
 }
 function stats(){let meshes=0,triangles=0,invalid=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;const a=o.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!Number.isFinite(a[i]))invalid++;}});return {meshes,triangles,invalid};}
 function solarMetrics(){let area=0,weighted=0,power=0;const sun=V(35,58,32).normalize();for(const w of wings){w.anchor.updateWorldMatrix(true,false);const n=V(0,1,0).applyQuaternion(w.anchor.getWorldQuaternion(new T.Quaternion()));const c=Math.max(0,n.dot(sun)),a=(w.len-w.pieces*.045)*(w.width-.2)*w.wing.scale.x;area+=a;weighted+=a*c;power+=a*c*1361*.27*.8/1000;}return {area,incident:area?weighted/area:0,power};}
 root.userData={unit:'metre',reference:'CMSE, photographed 2023-10-30',limitations:'Educational reconstruction. Public dimensions. Interior layout is interpretive.'};pose({},0);return {root,modules,shells,wings,arms,endpoints,pose,stats,solarMetrics,get revision(){return revision;}};}
