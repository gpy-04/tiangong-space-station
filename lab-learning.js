import * as T from 'three';
import {LAB_FACILITIES,LAB_MODULES,LAB_SOURCES} from './lab-data.js';

export function createLabLearning({ui,stage,station,freeCamera,setView,onInput,isCinema}){
 const inspector=document.querySelector('.inspector'),viewport=document.querySelector('.viewport');
 const panel=document.createElement('section');panel.id='labPanel';panel.className='lab-panel';panel.setAttribute('aria-label','实验设施讲解');
 const entry=document.createElement('button');entry.className='lab-entry';entry.innerHTML='<span>走近科学实验柜</span><b>设施目录与原理讲解 →</b>';entry.hidden=true;inspector.prepend(entry);
 const open=document.createElement('button');open.id='labOpen';open.className='lab-open';open.hidden=true;open.textContent='设施讲解';viewport.appendChild(open);
 const dialog=document.createElement('dialog');dialog.id='labDialog';dialog.setAttribute('aria-label','实验室设施讲解');ui.ui.appendChild(dialog);
 const dots=document.createElement('div');dots.id='labHotspots';dots.className='lab-hotspots';viewport.appendChild(dots);
 const racks=new Map();station.root.traverse(o=>{if(o.userData.labFacility)racks.set(o.userData.labFacility,o);});
 const markerData=LAB_FACILITIES.map(d=>{const b=document.createElement('button');b.className='lab-hotspot';b.dataset.labHotspot=d.id;b.setAttribute('aria-label','讲解：'+d.title);b.title=d.title;b.hidden=true;b.textContent=String(LAB_FACILITIES.filter(x=>x.module===d.module).indexOf(d)+1).padStart(2,'0');b.onclick=()=>select(d.id,{show:true});dots.appendChild(b);return {d,b,rack:racks.get(d.id),screen:new T.Vector3()};});
 // A teaching overlay is deliberately outside station.root, so it cannot be
 // exported as physical hardware or enter the camera's collision triangles.
 const lines=[],w=.47,h=1.10,l=.13;for(const sx of[-1,1])for(const sy of[-1,1]){lines.push(sx*(w-l),sy*h,.36,sx*w,sy*h,.36,sx*w,sy*h,.36,sx*w,sy*(h-l),.36);}
 const outline=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(lines,3)),new T.LineBasicMaterial({color:0xf5bb79,transparent:true,opacity:.9,depthWrite:false}));outline.matrixAutoUpdate=false;outline.visible=false;stage.scene.add(outline);
 let activeKind=null,selected=null,remembered={},step=0,gravity=.38,storage=4,enabled=false,mobile=matchMedia('(max-width:900px)'),lastContextKey='',outlineRevision=-1;
 const ray=new T.Raycaster(),p=new T.Vector3(),q=new T.Vector3(),dir=new T.Vector3(),local=new T.Vector3(),projection=new T.Vector3(),rackInverse=new T.Matrix4();
 const allMeshes=[];station.root.traverse(o=>{if(o.isMesh)allMeshes.push(o);});
 let occlusionTime=-Infinity;const visible=[];const accepted=[];
 const list=()=>LAB_FACILITIES.filter(d=>d.module===activeKind);
 function render(){
  if(!selected)return;const d=selected,items=list(),index=items.indexOf(d),source=LAB_SOURCES[d.source];step=0;
  panel.innerHTML=`<div class="lab-panel-top"><span>SCIENCE / FACILITY GUIDE</span><button class="lab-close" aria-label="关闭设施讲解">×</button></div>
   <div class="lab-module-switch" role="group" aria-label="切换实验室">${Object.entries(LAB_MODULES).map(([key,v])=>`<button data-lab-module="${key}" aria-pressed="${key===activeKind}">${v.name}实验室 <small>${LAB_FACILITIES.filter(x=>x.module===key).length}</small></button>`).join('')}</div>
   <label class="lab-directory-label" for="labDirectory">设施目录 <span>${index+1} / ${items.length}</span></label><select id="labDirectory" aria-label="选择实验设施">${items.map((x,i)=>`<option value="${x.id}" ${x===d?'selected':''}>${String(i+1).padStart(2,'0')}　${x.title}</option>`).join('')}</select>
   <p class="lab-module-note">${LAB_MODULES[activeKind].note}</p>
   <div class="lab-subject"><span>${d.en}</span><h2>${d.title}</h2><b>${d.category}</b><p>${d.intro}</p></div>
   <button id="labFocus" class="lab-focus">定位到这台设施 <span>↗</span></button>
   <div class="lab-reading"><section><h3>研究什么</h3><p>${d.research}</p></section><section><h3>怎样工作</h3><p>${d.principle}</p></section></div>
   <section class="lab-process"><div class="lab-process-heading">原理图解 <span>点击步骤阅读 · 功能示意</span></div>${d.demo==='gravity'?gravityMarkup():d.demo==='storage'?storageMarkup():processMarkup(d)}<p class="lab-step-copy" aria-live="polite" id="labStepCopy">${d.steps[0][1]}</p></section>
   <div class="lab-reading"><section><h3>为什么到太空做</h3><p>${d.meaning}</p></section><section><h3>对照模型看这里</h3><p>${d.look}</p></section></div>
   <div class="lab-takeaway"><span>记住这一点</span><p>${d.takeaway}</p></div>
   <div class="lab-pages"><button id="labPrev" ${index===0?'disabled':''}>← 上一设施</button><button id="labNext" ${index===items.length-1?'disabled':''}>下一设施 →</button></div>
   <details class="lab-evidence"><summary>报道依据与模型说明</summary><a href="${source.url}" target="_blank" rel="noopener">${source.title} ↗</a><small>${source.by}</small><p>功能按公开报道整理。外观、面板和位置为科普重建；原理图解不代表真实柜内结构与实时实验数据。</p></details>`;
  panel.querySelector('.lab-close').onclick=()=>dialog.open?dialog.close():setView(LAB_MODULES[activeKind].view,true);
  panel.querySelectorAll('[data-lab-module]').forEach(b=>b.onclick=()=>setView(LAB_MODULES[b.dataset.labModule].view,true));
  panel.querySelector('#labDirectory').onchange=e=>select(e.target.value);
  panel.querySelector('#labFocus').onclick=focus;
  panel.querySelector('#labPrev').onclick=()=>select(items[index-1]?.id);
  panel.querySelector('#labNext').onclick=()=>select(items[index+1]?.id);
  panel.querySelectorAll('[data-lab-step]').forEach(b=>b.onclick=()=>{step=+b.dataset.labStep;panel.querySelectorAll('[data-lab-step]').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.labStep===step)));panel.querySelector('#labStepCopy').textContent=d.steps[step][1];onInput();});
  if(d.demo==='gravity'){panel.querySelector('#labGravity').oninput=e=>{gravity=+e.target.value;updateGravity();onInput();};updateGravity();}
  if(d.demo==='storage'){panel.querySelectorAll('[data-lab-temperature]').forEach(b=>b.onclick=()=>{storage=+b.dataset.labTemperature;updateStorage();onInput();});updateStorage();}
  const scroller=dialog.open?dialog:inspector;scroller.scrollTop=0;
 }
 function processMarkup(d){return `<ol class="lab-flow">${d.steps.map(([name],i)=>`<li><button data-lab-step="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><b>${name}</b></button></li>`).join('')}</ol>`;}
 function gravityMarkup(){return `<div class="lab-gravity"><svg viewBox="0 0 240 124" role="img" aria-label="样品旋转，向心加速度箭头指向转轴的原理示意"><circle cx="120" cy="62" r="46" class="lab-orbit"/><g class="lab-rotor"><line x1="120" y1="62" x2="166" y2="62"/><circle cx="166" cy="62" r="7"/><path d="M157 62h-24m5-5-5 5 5 5"/></g><circle cx="120" cy="62" r="4"/><text x="12" y="17">a = ω²r</text><text x="12" y="112">样品半径 r = 0.30 m（示例）</text></svg><label for="labGravity">等效加速度 <output id="labGravityValue"></output></label><input id="labGravity" type="range" min=".01" max="2" step=".01" value="${gravity}"><div class="lab-gravity-readout"><span>示例转速 <b id="labGravityRpm"></b> rpm</span><small>动画放慢8倍，箭头指向转轴</small></div></div>`;}
 function updateGravity(){const rpm=Math.sqrt(gravity*9.80665/.3)*60/(2*Math.PI);panel.querySelector('#labGravityValue').textContent=gravity.toFixed(2)+' g';panel.querySelector('#labGravityRpm').textContent=rpm.toFixed(1);panel.querySelector('.lab-rotor').style.animationDuration=(480/rpm).toFixed(3)+'s';panel.querySelector('#labStepCopy').textContent='调节的是样品的旋转加速度。这里用0.30 m示例半径计算转速，未使用真实离心机安装尺寸。';}
 function storageMarkup(){return `<div class="lab-storage" role="group" aria-label="了解典型保存温区">${[4,-20,-80].map(t=>`<button data-lab-temperature="${t}" aria-pressed="${t===storage}"><span>❄</span><b>${t>0?'+':''}${t} ℃</b></button>`).join('')}</div><p class="lab-storage-note">选择温区了解用途 · 不是设备控制</p>`;}
 function updateStorage(){const text={4:'冷藏温区。适合需要低温但不宜直接冻结的特定样品；具体要求由实验方案决定。','-20':'冷冻温区。供符合该保存条件的样品使用，不能据此判断所有生物样品都适合冻结。','-80':'更低温的冷冻条件。用于有相应保存要求的样品；这里不把温度高低当作样品质量排名。'};panel.querySelectorAll('[data-lab-temperature]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.labTemperature===storage)));panel.querySelector('#labStepCopy').textContent=text[storage];}
 function mount(){
  if(mobile.matches){if(panel.parentElement!==dialog)dialog.appendChild(panel);}else{if(dialog.open)dialog.close();if(panel.parentElement!==inspector)inspector.appendChild(panel);}
 }
 function show(){mount();if(mobile.matches&&!dialog.open){freeCamera.clear();if(document.pointerLockElement)document.exitPointerLock();dialog.showModal();}onInput();}
 function select(id,{show:showPanel=false}={}){const d=LAB_FACILITIES.find(x=>x.id===id);if(!d||d.module!==activeKind)return false;selected=d;remembered[activeKind]=id;outlineRevision=-1;render();markerData.forEach(x=>x.b.classList.toggle('selected',x.d.id===id));if(showPanel)show();onInput();occlusionTime=-Infinity;return true;}
 function focus(){
  if(!selected)return;const rack=racks.get(selected.id),mod=station.modules[activeKind];if(!rack)return;
  // An authored clear central-aisle position. Reset the cabin entry before
  // relocation so every request starts in this module, with no wall flight.
  const id=selected.id;setView(LAB_MODULES[activeKind].view,true);select(id);
  mod.updateWorldMatrix(true,true);p.set(-rack.userData.side*.42,.08,rack.position.z-.48).applyMatrix4(mod.matrixWorld);
  freeCamera.relocate(p);q.set(0,.05,.31).applyMatrix4(rack.matrixWorld);stage.controls.target.copy(q);stage.camera.fov=78;stage.camera.updateProjectionMatrix();stage.camera.lookAt(q);freeCamera.enter(activeKind);
  if(dialog.open)dialog.close();onInput();
 }
 function context(state){
  const kind=state.interior&&LAB_MODULES[state.topic]?state.topic:null,nextEnabled=!!kind&&!isCinema(),launch=!state.interior&&LAB_MODULES[state.topic]&&!isCinema();
  const key=`${kind||''}:${nextEnabled}:${!!launch}:${state.topic}`;if(key===lastContextKey)return;lastContextKey=key;
  enabled=nextEnabled;
  entry.hidden=!launch;entry.onclick=()=>setView(LAB_MODULES[state.topic].view,true);
  if(activeKind!==kind){activeKind=kind;if(!kind){if(dialog.open)dialog.close();selected=null;outline.visible=false;}else{selected=LAB_FACILITIES.find(d=>d.id===remembered[kind])||list()[0];render();mount();}}
  inspector.classList.toggle('lab-mode',enabled);viewport.classList.toggle('lab-active',enabled);open.hidden=!enabled;open.textContent='设施讲解 · '+(kind?list().length:'');dots.hidden=!enabled;outline.visible=enabled&&!!selected;panel.hidden=!enabled;
  if(!enabled&&dialog.open)dialog.close();
 }
 function update(state,t){
  context(state);if(!enabled)return;
  if(outlineRevision!==station.revision){const rack=racks.get(selected?.id);if(rack){outline.matrix.copy(rack.matrixWorld);outline.matrixWorldNeedsUpdate=true;}outlineRevision=station.revision;}
  const refreshOcclusion=t-occlusionTime>.18;visible.length=0;
  for(const item of markerData){
   if(item.d.module!==activeKind||!item.rack){item.b.hidden=true;continue;}
   p.set(0,.88,.36).applyMatrix4(item.rack.matrixWorld);projection.copy(p).project(stage.camera);rackInverse.copy(item.rack.matrixWorld).invert();local.copy(stage.camera.position).applyMatrix4(rackInverse);
   const distance=stage.camera.position.distanceTo(p),inFrame=projection.z>-1&&projection.z<1&&Math.abs(projection.x)<.90&&projection.y<.84&&projection.y>-.83&&local.z>.32&&distance<8;
   item.b.hidden=!inFrame;if(!inFrame)continue;
   item.screen.set((projection.x*.5+.5)*viewport.clientWidth,(-projection.y*.5+.5)*viewport.clientHeight,distance);item.b.style.left=item.screen.x+'px';item.b.style.top=item.screen.y+'px';visible.push(item);
   if(refreshOcclusion){dir.copy(p).sub(stage.camera.position).normalize();ray.set(stage.camera.position,dir);ray.near=.035;ray.far=distance-.045;item.occluded=ray.intersectObjects(allMeshes,false).length>0;}
   item.b.hidden=!!item.occluded;
  }
  if(refreshOcclusion)occlusionTime=t;
  // Do not stack distant numbered buttons on top of one another.
  visible.sort((a,b)=>a.screen.z-b.screen.z);accepted.length=0;for(const item of visible){if(item.b.hidden)continue;if(accepted.some(x=>Math.hypot(x.screen.x-item.screen.x,x.screen.y-item.screen.y)<38)){item.b.hidden=true;continue;}accepted.push(item);}
 }
 function pick(object){if(!enabled)return false;let o=object;while(o&&!o.userData.labFacility)o=o.parent;return o?.userData.labFacility?select(o.userData.labFacility,{show:true}):false;}
 open.onclick=show;dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{freeCamera.clear();onInput();});mobile.addEventListener('change',mount);
 return {context,update,select,focus,pick,inspect:()=>({active:enabled,module:activeKind,selected:selected?.id,facilityCount:list().length,annotatedRacks:racks.size,visibleHotspots:markerData.filter(x=>!x.b.hidden).map(x=>x.d.id),dialogOpen:dialog.open})};
}
