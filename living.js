import * as T from 'three';
import {M,canvasTex,labelMat} from './materials.js';

// Shared metre-space layout. The camera routes and clearance checks use it too.
export const LIVING_LAYOUT={
 smallFloor:-.96,smallRadius:1.28,aisleHalfWidth:.39,
 berths:[{side:-1,z:2.95},{side:1,z:2.95},{side:-1,z:5.10}],
 hygiene:{side:1,z:5.10},treadmill:{z:3.15},
 galley:{x:-1.27,z:8.65},dining:{x:-1.23,z:10.35},bike:{x:-.9,z:12.2},
};

export function createLivingArea(parent,a){
 const {group,mesh,box,cyl,link,tube,placard,optimize}=a;
 const root=group(parent,'生活区 / 睡眠 · 卫生 · 餐饮 · 锻炼');root.userData.topic='life';
 const fixtures=[],architecture=group(root,'通道与舱内饰板');
 const warm=new T.MeshStandardMaterial({name:'睡眠区暖白内饰',color:0xcac7b4,roughness:.89});
 const bagMap=canvasTex(512,1024,(c,w,h)=>{c.fillStyle='#7185b8';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=128){c.strokeStyle='#3e558b';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(w*.3,y-16,w*.7,y+14,w,y);c.stroke();}c.strokeStyle='#afbbd7';c.lineWidth=3;c.strokeRect(18,8,w-36,h-16);});
 const bagMat=new T.MeshStandardMaterial({name:'蓝色睡袋与缝线',map:bagMap,roughness:.95});
 const units=[];
 function unit(name,pos){const g=group(root,name,pos);g.userData.livingUnit=true;g.userData.keep=true;units.push(g);return g;}
 function sign(g,title,sub,pos,side=-1,size=[.68,.15]){return placard(g,title,sub,pos,[0,side<0?Math.PI/2:-Math.PI/2,0],size);}
 function handle(g,pos,axis='z',mat=M.green,length=.18){const [x,y,z]=pos;const d=axis==='z'?[0,0,length/2]:[0,length/2,0];for(let s of[-1,1])link(g,[x-sideOf(x)*.025,y+s*d[1],z+s*d[2]],[x,y+s*d[1],z+s*d[2]],.012,M.silver);link(g,[x,y-d[1],z-d[2]],[x,y+d[1],z+d[2]],.015,mat);}
 function sideOf(x){return x>=0?1:-1;}
 function panelOpening(g,x,width,height,mat,holeCircle=false){
  const s=new T.Shape();s.moveTo(-width/2,-height/2);s.lineTo(width/2,-height/2);s.lineTo(width/2,height/2);s.lineTo(-width/2,height/2);s.closePath();
  const h=new T.Path();if(holeCircle)h.absarc(0,.04,.135,0,Math.PI*2,true);else{const w=width/2-.075,k=height/2-.075,r=.075;h.moveTo(-w+r,-k);h.lineTo(w-r,-k);h.quadraticCurveTo(w,-k,w,-k+r);h.lineTo(w,k-r);h.quadraticCurveTo(w,k,w-r,k);h.lineTo(-w+r,k);h.quadraticCurveTo(-w,k,-w,k-r);h.lineTo(-w,-k+r);h.quadraticCurveTo(-w,-k,-w+r,-k);h.closePath();}
  s.holes.push(h);const m=mesh(g,new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSize:.009,bevelThickness:.008,bevelSegments:2,curveSegments:24}),mat,'带真实开口的舱内饰板');m.rotation.y=Math.PI/2;m.position.set(x,-.025,0);return m;
 }
 function softBag(g,x,z){
  const n=32,m=20,positions=[],uv=[],idx=[];
  for(let j=0;j<=n;j++){const v=j/n,zz=z+(v-.5)*1.69,ww=.237*(.75+.25*Math.sin(Math.PI*v));for(let i=0;i<=m;i++){const u=i/m,xx=x+(u-.5)*ww*2,y=-.515+.065*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+.005*Math.sin(v*55+u*11)*Math.sin(Math.PI*u);positions.push(xx,y,zz);uv.push(u,v);}}
  for(let j=0;j<n;j++)for(let i=0;i<m;i++){const b=j*(m+1)+i;idx.push(b,b+m+1,b+1,b+1,b+m+1,b+m+2);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const surface=mesh(g,geo,bagMat,'有厚度底衬的柔性睡袋表面');box(g,[x,-.545,z],[.475,.045,1.69],bagMat,'睡袋底衬');
  const pillowGeo=new T.SphereGeometry(1,32,20),pa=pillowGeo.attributes.position;
  const sp=(v,e)=>Math.sign(v)*Math.pow(Math.abs(v),e);
  for(let i=0;i<pa.count;i++)pa.setXYZ(i,sp(pa.getX(i),.55)*.195,sp(pa.getY(i),.8)*.044,sp(pa.getZ(i),.55)*.12);
  pillowGeo.computeVertexNormals();const pillow=mesh(g,pillowGeo,bagMat,'鼓起的织物枕垫');pillow.position.set(x,-.477,z-.67);
  for(const dz of[-.35,.32]){box(g,[x,-.443,z+dz],[.48,.018,.045],M.dark,'睡袋固定带');box(g,[x+.12,-.426,z+dz],[.055,.017,.06],M.silver,'束缚带卡扣');}
 }
 // Open cabin frames. No dark plane is used to fake the berth aperture.
 for(const [i,b]of LIVING_LAYOUT.berths.entries()){
  const g=unit('独立睡眠舱 '+(i+1),[b.side*.77,0,b.z]),s=b.side;
  for(const z of[-.97,.97])box(g,[0,-.02,z],[.64,1.18,.025],warm,'舱室隔板');
  box(g,[0,-.62,0],[.64,.045,1.96],warm,'睡眠舱底板');box(g,[0,.59,0],[.64,.035,1.96],warm,'睡眠舱顶板');
  panelOpening(g,-s*.32,1.96,1.30,M.panel);
  // A recessed circular observation-window surround and glass behind it.
  const wall=panelOpening(g,s*.30,1.96,1.18,warm,true);wall.position.y=-.02;
  const port=mesh(g,new T.TorusGeometry(.145,.014,8,40),M.silver,'睡眠舱观察窗压圈');port.rotation.y=Math.PI/2;port.position.set(s*.252,.02,0);
  cyl(g,[s*.32,.02,0],.13,.012,M.glass,'x','观察窗内层玻璃');
  softBag(g,0,0);
  // Personal stowage, data terminal, directed lamp and ventilation grille.
  box(g,[s*.23,.32,-.58],[.11,.31,.48],M.fabric,'个人物品收纳袋');for(let z of[-.72,-.44])box(g,[s*.166,.32,z],[.016,.25,.025],M.dark,'收纳袋固定带');
  box(g,[s*.22,.18,.68],[.1,.29,.32],M.panel,'睡眠舱控制盒');box(g,[s*.156,.20,.68],[.016,.16,.23],M.screen,'控制屏');
  for(let z of[-.2,.2])handle(g,[-s*.35,.55,z],'z',M.green,.19);
  box(g,[0,.55,-.53],[.38,.018,.38],M.panel,'通风面板');for(let j=0;j<9;j++)box(g,[-.15+j*.037,.534,-.53],[.012,.012,.29],M.dark,'通风口');
  box(g,[s*.15,.51,.42],[.16,.03,.36],M.light,'阅读灯');
  sign(g,'睡眠区 '+(i+1),'CREW QUARTERS',[-s*.343,.72,0],s,[.84,.14]);
  sign(g,'个人收纳','STOWAGE',[s*.158,.32,-.58],s,[.4,.09]);
  // Door curtain bundled into the frame leaves the opening clear.
  for(let j=0;j<7;j++)box(g,[-s*.29,.34+j*.027,.89],[.04,.024,.08],M.fabric,'收拢隐私帘');
 }
 const hy=unit('独立卫生区',[.77,0,5.10]);
 box(hy,[.30,-.02,0],[.035,1.18,1.96],warm);for(const z of[-.97,.97])box(hy,[0,-.02,z],[.64,1.18,.025],warm);box(hy,[0,-.62,0],[.64,.045,1.96],warm);box(hy,[0,.59,0],[.64,.035,1.96],warm);panelOpening(hy,-.32,1.96,1.30,M.panel);
 box(hy,[.03,-.39,-.39],[.42,.35,.45],M.panel,'气流式卫生设备基座');cyl(hy,[.03,-.195,-.39],.15,.035,M.silver,'y','卫生设备口沿');cyl(hy,[.03,-.171,-.39],.112,.012,M.dark,'y','卫生设备入口');
 for(let z of[-.67,-.12])box(hy,[.02,-.25,z],[.33,.035,.065],M.dark,'腿部固定支托');
 tube(hy,[[.12,-.36,.04],[-.03,-.32,.12],[-.13,-.08,.27],[-.09,.18,.35]],.026,M.dark);const funnel=mesh(hy,new T.ConeGeometry(.065,.12,20,1,true),M.silver,'卫生软管接口');funnel.rotation.x=Math.PI/2;funnel.position.set(-.09,.18,.40);
 box(hy,[.22,.20,.64],[.1,.47,.39],M.panel,'卫生用品柜');handle(hy,[.156,.22,.65],'y',M.green,.17);box(hy,[.21,.47,-.54],[.11,.10,.36],M.light);sign(hy,'卫生区','HYGIENE',[-.343,.72,0],1,[.84,.14]);
 // Continuous clear aisle with a recessed treadmill, beside the berth openings.
 for(let z=1.85;z<6.55;z+=.4){box(architecture,[0,-.96,z],[.78,.045,.38],M.panel,'小柱段通道板');for(let x of[-.34,.34])box(architecture,[x,-.932,z],[.035,.009,.22],M.dark,'脚部固定槽');}
 for(let z=1.9;z<6.6;z+=.47){box(architecture,[0,1.01,z],[1.1,.035,.45],M.panel,'小柱段顶部维护板');for(let x of[-.40,.40])box(architecture,[x,.984,z],[.09,.018,.25],M.light);}
 const run=unit('跑台 / 隔振与身体加载',[0,-.80,3.15]);
 box(run,[0,-.035,0],[.61,.09,1.62],M.silver,'跑台隔振框架');box(run,[0,.023,0],[.45,.035,1.46],M.rubber,'跑带');for(let z of[-.7,.7])cyl(run,[0,.025,z],.045,.45,M.dark,'x','跑带滚筒');
 for(let x of[-.29,.29]){box(run,[x,.029,0],[.055,.04,1.58],M.panel,'跑台侧梁');tube(run,[[x,.035,.50],[x,.89,.50],[x*.72,1.00,.50]],.018,M.silver);for(let z of[-.59,.59])box(run,[x,-.10,z],[.07,.07,.11],M.dark,'隔振支座');}
 link(run,[-.21,1,.50],[.21,1,.50],.022,M.rubber);box(run,[0,.92,.53],[.20,.11,.04],M.screen,'跑台显示终端');
 // Restraint straps lie to the sides instead of crossing the camera walkway.
 for(let s of[-1,1])tube(run,[[s*.26,.08,-.45],[s*.31,.28,-.23],[s*.28,.40,.18]],.012,M.fabric);
 const gal=unit('太空厨房 / 食品加热与饮水',[-1.27,0,8.65]);
 box(gal,[-.06,0,0],[.48,2.12,1.03],M.panel,'厨房设备柜');
 box(gal,[.195,.42,-.20],[.035,.65,.53],M.silver,'食品加热器门框');box(gal,[.218,.42,-.20],[.016,.48,.38],M.dark,'加热器门');handle(gal,[.244,.43,.055],'y',M.silver,.36);
 box(gal,[.21,.91,0],[.025,.20,.80],M.panel);sign(gal,'食品加热装置','FOOD WARMER',[.238,.92,0],-1,[.76,.15]);
 box(gal,[.20,-.29,0],[.03,.56,.81],M.silver,'饮水装置接口面');box(gal,[.225,-.17,-.20],[.018,.15,.23],M.screen,'水温显示');for(let z of[-.16,.18]){cyl(gal,[.25,-.41,z],.035,.045,M.silver,'x');tube(gal,[[.25,-.41,z],[.35,-.41,z],[.36,-.53,z]],.011,M.silver);}
 box(gal,[.21,-.83,0],[.03,.39,.83],M.panel,'食品冷藏与储物柜');for(let z of[-.24,.24])handle(gal,[.251,-.8,z],'y',M.green,.15);sign(gal,'冷藏 / 食品储存','FOOD STORAGE',[.238,-.66,0],-1,[.67,.10]);
 const dine=unit('折叠餐桌 / 食物与餐具固定',[-1.23,0,10.35]);
 box(dine,[-.23,.20,0],[.045,1.48,1.47],M.panel,'餐桌安装壁板');
 box(dine,[.07,-.37,0],[.63,.045,1.47],M.panel,'折叠餐桌面');for(let z of[-.55,.55]){link(dine,[-.20,-.75,z],[.33,-.39,z],.018,M.silver);cyl(dine,[-.20,-.36,z],.05,.08,M.silver,'z','桌板铰链');}
 for(let z of[-.46,0,.46]){box(dine,[.05,-.328,z],[.44,.022,.30],M.silver,'餐盘');box(dine,[.05,-.303,z],[.40,.015,.035],M.green,'餐具固定带');for(let x of[-.07,.14]){cyl(dine,[x,-.302,z+.065],.055,.028,M.orange,'y','食品包装');}cyl(dine,[.20,-.263,z-.07],.042,.12,M.panel,'y','带盖饮水袋接口');}
 sign(dine,'餐饮区','DINING / FOOD & WATER',[-.196,.74,0],-1,[1.18,.21]);
 const laptop=group(dine,'舱载计算机',[.02,.05,.31]);box(laptop,[0,0,0],[.035,.32,.47],M.dark);box(laptop,[.026,0,0],[.018,.26,.40],M.screen);tube(dine,[[-.17,.05,.31],[-.05,.04,.31],[.02,.05,.31]],.016,M.silver);
 const bike=unit('功率自行车 / 座椅与脚踏束缚',[-.88,-.68,12.22]);
 box(bike,[0,-.45,0],[.72,.08,.86],M.silver,'自行车安装底座');for(let x of[-.27,.27])for(let z of[-.3,.3]){box(bike,[x,-.58875,z],[.08,.2275,.10],M.silver,'连接舱内地板的安装柱');box(bike,[x,-.7075,z],[.14,.01,.16],M.dark,'隔振固定垫');}
 link(bike,[0,-.39,0],[0,.29,.20],.05,M.silver);box(bike,[0,.34,.23],[.36,.08,.30],M.dark,'自行车座椅');box(bike,[0,.40,.23],[.36,.027,.055],M.fabric,'座椅束缚带');
 cyl(bike,[0,-.16,-.09],.20,.26,M.panel,'x','阻力飞轮');link(bike,[-.23,-.06,-.09],[.23,-.28,-.09],.025,M.silver);for(let s of[-1,1]){box(bike,[s*.25,s<0?-.06:-.28,-.09],[.17,.035,.22],M.dark,'脚踏板');tube(bike,[[s*.25-.07,s<0?-.03:-.25,-.17],[s*.25,s<0?.04:-.18,-.1],[s*.25+.07,s<0?-.03:-.25,-.17]],.009,M.fabric);}
 tube(bike,[[0,-.31,-.31],[0,.37,-.34],[-.17,.46,-.34]],.024,M.silver);link(bike,[-.17,.46,-.34],[.17,.46,-.34],.023,M.rubber);box(bike,[0,.38,-.37],[.21,.13,.035],M.screen,'锻炼数据显示');
 const stow=unit('日常物资与应急设备',[-1.29,-.88,7.84]);
 for(let z of[-.13,.13]){box(stow,[-.28,0,z],[.10,.30,.06],M.silver,'货包壁面安装轨');box(stow,[-.20,-.19,z],[.25,.025,.08],M.silver,'货包支托');}
 box(stow,[0,0,0],[.46,.38,.38],M.fabric,'软质货包');for(let z of[-.12,.12])box(stow,[.24,0,z],[.018,.31,.032],M.dark,'货包束缚带');cyl(stow,[.08,.43,.16],.065,.45,M.red,'y','便携式灭火器');for(let y of[.32,.57])box(stow,[.15,y,.16],[.05,.035,.13],M.dark,'灭火器固定座');
 const medical=unit('医监医保 / 医疗用品与便携监测',[1.27,0,12.70]);
 box(medical,[.10,0,0],[.50,1.74,.77],M.panel,'医监医保安装柜');sign(medical,'医监医保','CREW HEALTH',[-.163,.67,0],1,[.68,.18]);
 box(medical,[-.16,.27,0],[.035,.36,.56],M.screen,'便携健康监测终端');
 const medicalScreen=mesh(medical,new T.PlaneGeometry(.50,.28),labelMat('医监终端','PORTABLE MONITOR / STANDBY',true),'医监终端待机界面');medicalScreen.position.set(-.181,.27,0);medicalScreen.rotation.y=-Math.PI/2;
 box(medical,[-.18,-.29,0],[.08,.48,.58],M.fabric,'医疗用品固定袋');for(let z of[-.19,.19])box(medical,[-.229,-.29,z],[.018,.42,.035],M.green,'医疗用品束缚带');
 box(medical,[-.235,-.29,0],[.012,.20,.055],M.red,'医疗标识');box(medical,[-.235,-.29,0],[.012,.055,.20],M.red,'医疗标识');
 for(let y of[-.66,.55])handle(medical,[-.22,y,0],'z',M.green,.38);
 const resistance=unit('抗阻锻炼装置 / 收拢状态',[-1.27,0,13.05]);
 box(resistance,[-.12,0,0],[.43,1.60,.36],M.panel,'抗阻装置壁面安装框');
 for(let z of[-.10,.10]){cyl(resistance,[.115,-.30,z],.09,.05,M.dark,'x','阻力加载轮');tube(resistance,[[.15,-.30,z],[.22,.25,z],[.20,.62,z]],.009,M.dark);}
 link(resistance,[.20,.62,-.14],[.20,.62,.14],.019,M.rubber);sign(resistance,'抗阻锻炼','RESISTIVE EXERCISE',[.113,.10,0],-1,[.30,.16]);
 // Keep ownership until semantic checks complete, then merge inside each fixture.
 root.updateMatrixWorld(true);
 for(const g of units){const b=new T.Box3().setFromObject(g);g.userData.layoutBounds={min:b.min.toArray(),max:b.max.toArray()};fixtures.push({name:g.name,min:b.min.toArray(),max:b.max.toArray()});optimize(g);}
 optimize(architecture);root.userData.fixtures=fixtures;
 return root;
}
