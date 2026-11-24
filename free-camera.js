import * as T from 'three';
import {createCabinCollider,CAMERA_RADIUS} from './cabin-collision.js';

export function createFreeCamera({camera,controls,canvas,station,isActive,onInput,onReset,onExit}){
 const hud=document.getElementById('freeCameraHud'),touch=document.getElementById('flyTouch'),lockButton=document.getElementById('flyLock'),status=document.getElementById('flyStatus'),keys=new Set(),touchAxes=new Map(),cache=new Map();
 const forward=new T.Vector3(),right=new T.Vector3(),up=new T.Vector3(0,1,0),desired=new T.Vector3(),velocity=new T.Vector3(),delta=new T.Vector3(),old=new T.Vector3(),actual=new T.Vector3();
 let active=false,kind='tianhe',yaw=0,pitch=0,drag=null,speed=.85,collider=null,lastHit=false,travel=0;
 const enabled=()=>active&&isActive()&&!document.querySelector('dialog[open]');
 const inputKeys=new Set(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyC','ShiftLeft','ShiftRight']);
 function clear(){keys.clear();touchAxes.clear();velocity.set(0,0,0);drag=null;touch.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));}
 function syncAngles(){camera.getWorldDirection(forward);yaw=Math.atan2(forward.x,forward.z);pitch=Math.asin(T.MathUtils.clamp(forward.y,-1,1));}
 function orient(){forward.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));controls.target.copy(camera.position).addScaledVector(forward,4);camera.up.set(0,1,0);camera.lookAt(controls.target);}
 function look(dx,dy){yaw-=dx*.0028;pitch=T.MathUtils.clamp(pitch-dy*.0028,-1.48,1.48);orient();onInput();}
 function enter(nextKind){
  clear();active=true;kind=nextKind;collider=cache.get(kind);if(!collider){collider=createCabinCollider(station,kind);cache.set(kind,collider);}syncAngles();orient();hud.hidden=false;touch.hidden=false;
  document.getElementById('flyCabin').textContent={tianhe:'天和核心舱',wentian:'问天实验舱',mengtian:'梦天实验舱'}[kind];status.textContent='可自由移动 · 防穿模已开启';
 }
 function exit(){active=false;clear();hud.hidden=true;touch.hidden=true;if(document.pointerLockElement===canvas)document.exitPointerLock();}
 function update(dt){
  if(!enabled()){if(active)clear();return;}dt=Math.min(.05,Math.max(0,dt));
  camera.getWorldDirection(forward);right.crossVectors(forward,up).normalize();let x=0,y=0,z=0;
  if(keys.has('KeyW')||keys.has('ArrowUp'))z++;if(keys.has('KeyS')||keys.has('ArrowDown'))z--;if(keys.has('KeyD')||keys.has('ArrowRight'))x++;if(keys.has('KeyA')||keys.has('ArrowLeft'))x--;if(keys.has('KeyE')||keys.has('Space'))y++;if(keys.has('KeyQ')||keys.has('KeyC'))y--;
  for(const v of touchAxes.values()){x+=v.x||0;y+=v.y||0;z+=v.z||0;}
  desired.copy(forward).multiplyScalar(T.MathUtils.clamp(z,-1,1)).addScaledVector(right,T.MathUtils.clamp(x,-1,1)).addScaledVector(up,T.MathUtils.clamp(y,-1,1));
  if(desired.lengthSq()>1)desired.normalize();desired.multiplyScalar(speed*(keys.has('ShiftLeft')||keys.has('ShiftRight')?1.8:1));
  velocity.lerp(desired,1-Math.exp(-(desired.lengthSq()?14:22)*dt));if(velocity.lengthSq()<1e-7)velocity.set(0,0,0);
  if(velocity.lengthSq()){
   old.copy(camera.position);delta.copy(velocity).multiplyScalar(dt);lastHit=collider.move(camera.position,delta);actual.copy(camera.position).sub(old);travel+=actual.length();
   if(dt>0&&lastHit)velocity.copy(actual).multiplyScalar(1/dt);onInput();orient();
  }else lastHit=false;
  status.textContent=lastHit?'已靠近设备或舱壁 · 可沿侧面移动':'可自由移动 · 防穿模已开启';status.classList.toggle('contact',lastHit);
 }
 canvas.tabIndex=0;
 canvas.addEventListener('pointerdown',e=>{if(!enabled())return;canvas.focus({preventScroll:true});onInput();if(document.pointerLockElement===canvas)return;syncAngles();drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!enabled())return;if(document.pointerLockElement===canvas){look(e.movementX,e.movementY);return;}if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;look(dx,dy);});
 function endDrag(e){if(drag?.id===e.pointerId)drag=null;}
 canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 canvas.addEventListener('contextmenu',e=>{if(enabled())e.preventDefault();});
 canvas.addEventListener('wheel',e=>{if(!enabled()||e.ctrlKey)return;e.preventDefault();nudge(T.MathUtils.clamp(e.deltaY*.0015,-.35,.35));},{passive:false});
 document.addEventListener('keydown',e=>{
  if(!enabled()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable="true"],dialog'))return;
  if(inputKeys.has(e.code)){if(e.code==='Space'&&e.target.closest('button'))return;e.preventDefault();keys.add(e.code);onInput();}
  if(e.code==='KeyR'&&!e.repeat){e.preventDefault();clear();onReset();}
  if(e.code==='Escape'){clear();if(document.pointerLockElement===canvas)document.exitPointerLock();}
 });
 document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 document.addEventListener('pointerlockchange',()=>{clear();if(document.pointerLockElement===canvas)syncAngles();lockButton.textContent=document.pointerLockElement===canvas?'释放鼠标 · Esc':'鼠标锁定环视';});
 document.addEventListener('pointerlockerror',()=>{status.textContent='可拖动画面环视；键盘移动仍可使用';});
 lockButton.onclick=async()=>{if(!enabled())return;if(document.pointerLockElement===canvas){document.exitPointerLock();return;}try{await canvas.requestPointerLock();}catch{status.textContent='可拖动画面环视；键盘移动仍可使用';}};
 document.getElementById('flyReset').onclick=()=>{clear();onReset();};document.getElementById('flyExit').onclick=onExit;
 document.getElementById('flySpeed').onchange=e=>{speed=+e.target.value;};
 for(const b of touch.querySelectorAll('[data-fly]')){
  b.addEventListener('pointerdown',e=>{if(!enabled())return;e.preventDefault();const v={forward:{z:1},back:{z:-1},left:{x:-1},right:{x:1},up:{y:1},down:{y:-1}}[b.dataset.fly];touchAxes.set(e.pointerId,v);b.classList.add('pressed');b.setPointerCapture(e.pointerId);onInput();});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,e=>{touchAxes.delete(e.pointerId);b.classList.remove('pressed');});
 }
 function nudge(amount){if(!enabled())return;camera.getWorldDirection(forward);old.copy(camera.position);lastHit=collider.move(camera.position,delta.copy(forward).multiplyScalar(amount));travel+=old.distanceTo(camera.position);velocity.set(0,0,0);orient();onInput();}
 function relocate(position){if(!enabled())return;clear();old.copy(camera.position);collider.move(camera.position,delta.copy(position).sub(camera.position));travel+=old.distanceTo(camera.position);orient();onInput();}
 function inspect(){return {active:active&&isActive(),kind,position:camera.position.toArray(),direction:camera.getWorldDirection(forward).toArray(),velocity:velocity.toArray(),yaw,pitch,speed,radius:CAMERA_RADIUS,distanceToSurface:collider?collider.distance(camera.position,1):null,travel,collision:collider?.stats,pointerLocked:document.pointerLockElement===canvas};}
 return {enter,exit,update,clear,nudge,relocate,inspect};
}
