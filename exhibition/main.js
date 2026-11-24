import {HISTORY} from './history.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const names={museum:'第一章 · 中国航天历史博物馆',station:'第二章 · 天宫空间站',rocket:'第三章 · 火箭与发射'};
let current='museum',submodel='rocket',announcementTimer=0,museumScroll=0;
const documents={station:JSON.parse($('#stationDocument').textContent),rocket:JSON.parse($('#launchDocument').textContent)};
const bridge=JSON.parse($('#bridgeSource').textContent),embedCSS=JSON.parse($('#embedStyles').textContent);
const loaded={station:false,rocket:false},ready={station:false,rocket:false},waiters={station:[],rocket:[]};
const periods=[
 {id:'beginnings',name:'从起步到载人',range:'1956 — 2008',until:2008},
 {id:'further',name:'向更远处探索',range:'2010 — 2019',until:2019},
 {id:'home',name:'建起太空家园',range:'2020 — 2022',until:2022},
 {id:'future',name:'奔向新的可能',range:'2023 — 2025',until:2025}
];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function toast(s){clearTimeout(announcementTimer);$('#chapterAnnouncer').textContent=s;$('#chapterAnnouncer').classList.add('show');announcementTimer=setTimeout(()=>$('#chapterAnnouncer').classList.remove('show'),2200)}
function injectDocument(kind){let html=documents[kind].replace('<html lang="zh-CN">',`<html lang="zh-CN" data-exhibit="${kind}">`);return html.replace('</head>',()=>`<style>${embedCSS}</style><script>${bridge.replace(/<\/script/gi,'<\\/script')}<\/script></head>`)}
function loadChapter(kind){if(loaded[kind])return;loaded[kind]=true;$('#'+kind+'Frame').srcdoc=injectDocument(kind)}
function runWhenReady(kind,fn){if(ready[kind])fn($('#'+kind+'Frame').contentWindow);else waiters[kind].push(fn)}
function navigate(chapter,{announce=true,history=true}={}){
 if(!names[chapter])chapter='museum';const old=current;
 if(old==='museum'&&chapter!=='museum')museumScroll=window.scrollY;
 if(old!==chapter&&old!=='museum'&&ready[old])$('#'+old+'Frame').contentWindow.__setExhibitVisible(false);
 current=chapter;document.body.dataset.chapter=chapter;
 $$('.chapter').forEach(s=>s.hidden=s.id!==chapter);
 $$('[data-chapter]').forEach(b=>{const on=b.dataset.chapter===chapter;b.classList.toggle('selected',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 if(old!==chapter)window.scrollTo({top:chapter==='museum'?museumScroll:0,behavior:'instant'});
 if(chapter!=='museum'){loadChapter(chapter);runWhenReady(chapter,w=>{w.__setExhibitVisible(current===chapter&&!document.hidden);if(current===chapter&&chapter==='rocket')w.longMarch10.switchModel(submodel)})}
 if(history&&location.hash!=='#'+chapter)window.history.pushState(null,'','#'+chapter);
 document.title=names[chapter]+' | 中国航天探索馆';if(announce&&chapter!==old)toast(names[chapter]);
}

function renderHistory(){
 $('#historyEntries').innerHTML=periods.map((period,i)=>{
  const items=HISTORY.filter(d=>{const year=+d.date.slice(0,4);return year<=period.until&&(i===0||year>periods[i-1].until)});
  return `<section class="history-era" id="era-${period.id}" aria-labelledby="era-title-${period.id}" tabindex="-1"><header class="era-heading"><span class="era-number">0${i+1}</span><div><p>${period.range}</p><h2 id="era-title-${period.id}">${period.name}</h2></div></header>${items.map(d=>{
   const local=d.era==='杭州与浙江',meaning=d.achievement.split('。')[0]+'。';
   return `<article class="history-entry${local?' local-entry':''}" data-history-id="${d.id}" id="event-${d.id}" tabindex="-1"><div class="history-entry-date"><time datetime="${d.date.replaceAll('.','-')}"><b>${d.date.slice(0,4)}</b><span>${d.date.slice(5).replace('.',' / ')}</span></time>${local?`<span class="local-marker">${escape(d.local)}</span>`:''}</div><div class="history-entry-copy"><span class="entry-category">${escape(local?d.badge:d.era)}</span><h3>${escape(d.name)}</h3><p class="history-entry-summary">${escape(d.summary)}${escape(meaning)}</p></div></article>`;
  }).join('')}</section>`;
 }).join('');
 $('#museumContents').innerHTML=periods.map((p,i)=>`<a data-history-jump href="#era-${p.id}"><span>0${i+1}</span>${p.name}</a>`).join('')+'<span class="contents-label">杭州与浙江</span>'+HISTORY.filter(d=>d.era==='杭州与浙江').map(d=>`<a class="local-jump" data-history-jump href="#event-${d.id}"><span>${d.date.slice(0,4)}</span>${escape(d.short)}</a>`).join('');
}
function jumpTo(id){const target=document.getElementById(id);if(!target)return;const top=window.scrollY+target.getBoundingClientRect().top-$('.global-header').offsetHeight-22;target.focus({preventScroll:true});window.scrollTo({top,behavior:reduced?'instant':'smooth'})}
renderHistory();
$$('[data-history-jump]').forEach(a=>a.onclick=e=>{e.preventDefault();jumpTo(a.getAttribute('href').slice(1))});
$('#museumTop').onclick=e=>{e.preventDefault();window.scrollTo({top:0,behavior:reduced?'instant':'smooth'})};
$$('[data-chapter]').forEach(b=>b.onclick=()=>navigate(b.dataset.chapter));
$$('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
$('.brand').onclick=e=>{e.preventDefault();navigate('museum');museumScroll=0;window.scrollTo({top:0,behavior:'instant'})};
$$('[data-rocket]').forEach(b=>b.onclick=()=>{submodel=b.dataset.rocket;$$('[data-rocket]').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on))});runWhenReady('rocket',w=>w.longMarch10.switchModel(submodel))});
addEventListener('message',e=>{
 const kind=['station','rocket'].find(k=>loaded[k]&&$('#'+k+'Frame').contentWindow===e.source);if(!kind||!e.data)return;const m=e.data;
 if(m.type==='aerospace:ready'&&m.kind===kind){ready[kind]=true;$('#'+kind).classList.add('ready');const w=$('#'+kind+'Frame').contentWindow;w.__setExhibitVisible(kind===current&&!document.hidden);for(const fn of waiters[kind].splice(0))fn(w)}
 else if(m.type==='aerospace:navigate'&&names[m.chapter])navigate(m.chapter);
});
$('#fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>toast('当前浏览器未开放全屏权限'))};
const uniqueSources=[...new Map(HISTORY.flatMap(d=>[d.source,...(d.relatedSources||[])]).map(s=>[s[1],s])).values()];
$('#historySources').innerHTML=uniqueSources.map(([name,url],i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><div><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(name)} ↗</a><small>${HISTORY.filter(d=>d.source[1]===url||d.relatedSources?.some(s=>s[1]===url)).map(d=>escape(d.date+' '+d.short)).join(' · ')}</small></div></article>`).join('');
$('#references').onclick=()=>{if(current==='museum')$('#sourcesDialog').showModal();else{const chapter=current,id=chapter==='station'?'sourcesBtn':submodel==='haolong'?'hl-source':'about';runWhenReady(chapter,w=>{if(current===chapter)w.document.getElementById(id)?.click()})}};
$('.dialog-close').onclick=()=>$('#sourcesDialog').close();$('#sourcesDialog').addEventListener('click',e=>{if(e.target===$('#sourcesDialog'))$('#sourcesDialog').close()});
if('scrollRestoration' in history)history.scrollRestoration='manual';
addEventListener('popstate',()=>navigate(location.hash.slice(1),{announce:false,history:false}));
addEventListener('hashchange',()=>{const chapter=location.hash.slice(1);if(names[chapter]&&current!==chapter)navigate(chapter,{history:false})});
document.addEventListener('visibilitychange',()=>{if(current!=='museum'&&ready[current])$('#'+current+'Frame').contentWindow.__setExhibitVisible(!document.hidden)});
navigate(names[location.hash.slice(1)]?location.hash.slice(1):'museum',{announce:false,history:false});
window.AEROSPACE={navigate,history:HISTORY,inspect:()=>({chapter:current,museumMode:'text',historyCount:HISTORY.length,localCount:HISTORY.filter(d=>d.era==='杭州与浙江').length,museumScroll:current==='museum'?window.scrollY:museumScroll,loaded:{...loaded},ready:{...ready}})};
