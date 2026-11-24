// Each embedded document owns its renderer. Only the visible chapter schedules frames.
(()=>{
 window.__LONG_MARCH_QA=true;
 const params=new URLSearchParams(location.search);
 const kind=document.documentElement.dataset.exhibit;
 let visible=true,seq=0;const pending=new Map(),nativeRAF=window.requestAnimationFrame.bind(window),nativeCancel=window.cancelAnimationFrame.bind(window);
 window.requestAnimationFrame=fn=>{const id=++seq,entry={fn,native:null};pending.set(id,entry);if(visible)entry.native=nativeRAF(now=>{pending.delete(id);fn(now)});return id};
 window.cancelAnimationFrame=id=>{const e=pending.get(id);if(e?.native!==null)nativeCancel(e.native);pending.delete(id)};
 window.__setExhibitVisible=on=>{on=!!on;if(visible===on)return;visible=on;window.dispatchEvent(new Event('blur'));if(!on){if(document.pointerLockElement)document.exitPointerLock();window.TIANGONG?.freeCamera.clear();for(const e of pending.values()){if(e.native!==null)nativeCancel(e.native);e.native=null}}else for(const [id,e]of pending){if(e.native===null)e.native=nativeRAF(now=>{pending.delete(id);e.fn(now)})}};
 const pauseAudio=()=>{if(!visible&&window.TIANGONG){const b=document.getElementById('soundBtn');if(b?.textContent.includes('关闭'))b.click()}};
 const set=window.__setExhibitVisible;window.__setExhibitVisible=on=>{set(on);pauseAudio()};
 function ready(){if(!window.SIM?.ready){setTimeout(ready,80);return}
  if(kind==='station'&&matchMedia('(prefers-reduced-motion: reduce)').matches){document.getElementById('skipIntro')?.click()}
  if(kind==='rocket'&&!window.longMarch10.getState().night)document.getElementById('lighting')?.click();
  if(kind==='rocket'&&window.__longMarchQA){const q=window.__longMarchQA;for(const exhibit of[q.haolong,q.cabin]){exhibit.scene.background?.set?.(0x09131d);if(exhibit.scene.fog)exhibit.scene.fog.color.set(0x09131d);}q.haolong.scene.environmentIntensity=.4;q.haolong.scene.traverse(o=>{if(o.isHemisphereLight)o.intensity=.55;if(o.isDirectionalLight)o.intensity*=.6;if(o.name==='科普展厅地面')o.material.color.set(0x142331)});const render=q.stage.renderer.render.bind(q.stage.renderer);q.stage.renderer.render=(scene,camera)=>{if(q.engineLab.active||q.haolong.active){if(scene.background?.isColor)scene.background.set(0x09131d);if(scene.fog)scene.fog.color.set(0x09131d)}return render(scene,camera)};q.stage.renderer.shadowMap.needsUpdate=true;}
  parent.postMessage({type:'aerospace:ready',kind},'*');
 }
 window.addEventListener('load',ready,{once:true});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.pointerLockElement)parent.postMessage({type:'aerospace:escape',kind},'*')});
 document.addEventListener('click',e=>{const go=e.target.closest('[data-exhibition-chapter]');if(go)parent.postMessage({type:'aerospace:navigate',chapter:go.dataset.exhibitionChapter},'*')});
 window.__exhibitInspect=()=>({kind,active:visible,pending:pending.size,ready:!!window.SIM?.ready});
})();
