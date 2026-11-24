import * as T from 'three';
const ease=t=>t*t*(3-2*t);const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export const SHOTS=[
 {at:0,pos:[13,3,45],target:[4,-5,-150],title:'在地球之上',sub:'约400公里 · 一座面向宇宙的实验室',topic:'overview'},
 {at:5,pos:[-23,3,23],target:[-17,0,11],title:'追逐一束太阳光',sub:'柔性太阳翼，为在轨生活持续供能',topic:'power'},
 {at:10,pos:[43,31,58],target:[0,0,3],title:'天宫，中国空间站',sub:'天和 · 问天 · 梦天 | T字三舱基本构型',topic:'overview'},
 {at:16,pos:[11,12,20],target:[0,0,8],title:'一座可以生活的空间站',sub:'独立睡眠空间、工作区与再生环境控制',topic:'life',xray:.9,cut:true},
 {at:18.5,pos:[0,.4,6.35],target:[0,-.18,2.1],travel:[0,0,-.12],title:'把日常，带上太空',sub:'独立睡眠舱 · 卫生区 · 跑台与固定装置',topic:'life',inside:true},
 {at:21,pos:[-4.2,.12,0],target:[-11.5,.05,0],title:'问天，探索生命',sub:'生命生态 · 生物技术 · 变重力科学',topic:'wentian',inside:true},
 {at:26,pos:[4.2,.12,0],target:[11.5,.05,0],title:'梦天，探索微重力',sub:'流体 · 燃烧 · 材料 · 超冷原子',topic:'mengtian',inside:true},
 {at:31,pos:[53,39,68],target:[0,0,4],title:'让每一层结构，都清晰可见',sub:'接下来，由你亲自探索',topic:'overview',explode:.7,xray:.32}
];
export function shotAt(t,intro=false){let arr=intro?SHOTS.slice(0,3):SHOTS;let i=arr.length-1;while(i>0&&t<arr[i].at)i--;let a=arr[i],b=arr[Math.min(i+1,arr.length-1)],end=b.at===a.at?(intro?15:36):b.at;let k=(a.inside||b.inside)?0:ease(Math.min(1,Math.max(0,(t-a.at)/(end-a.at))));const pa=a.pos.map((v,j)=>v+(a.travel?.[j]??(a.inside?(j===0?(a.pos[0]<0?-.14:.14):0):(j===0?1:j===1?.3:1)*.2))*Math.min(t-a.at,4));
 return {pos:mix(pa,b.pos,k),target:mix(a.target,b.target,k),title:a.title,sub:a.sub,topic:a.topic,xray:(a.xray||0)*(1-k)+(b.xray||0)*k,explode:(a.explode||0)*(1-k)+(b.explode||0)*k,cut:!!a.cut,inside:!!a.inside};}
export const CAMERA_VIEWS={
 overview:{pos:[43,31,58],target:[0,0,3]},top:{pos:[.1,84,5],target:[0,0,3]},back:{pos:[-48,23,-48],target:[0,0,3]},
 tianhe:{pos:[13,10,23],target:[0,0,8]},life:{pos:[6,5,10],target:[0,0,5]},wentian:{pos:[-10,9,15],target:[-10,0,0]},mengtian:{pos:[10,9,15],target:[10,0,0]},power:{pos:[-30,14,30],target:[-13,0,8]},arm:{pos:[12,9,14],target:[3,1,6]},docking:{pos:[12,10,-18],target:[0,0,-4]},
 insideCore:{pos:[0,.1,7.9],target:[0,0,12.6]},insideLife:{pos:[0,.40,6.35],target:[0,-.18,2.1]},insideBerth:{pos:[.08,.20,6.04],target:[-.77,-.14,5.1]},insideGalley:{pos:[.18,.22,10.85],target:[-1.15,-.1,9.5]},insideHealth:{pos:[.10,.22,12.15],target:[1.27,0,12.7]},insideFitness:{pos:[.10,.24,10.95],target:[-.88,-.55,12.22]},insideWT:{pos:[-4.1,.05,0],target:[-11.9,0,0]},insideMT:{pos:[4.1,.05,0],target:[11.9,0,0]}
};
export const WALK_ROUTES={insideHealth:[[.10,.22,12.15],[.10,.22,12.65]],insideCore:[[0,.10,7.9],[0,.10,12.35]],insideLife:[[0,.40,6.35],[0,.40,1.85]],insideBerth:[[.08,.20,6.04],[.08,.20,5.35]],insideGalley:[[.18,.22,10.85],[.18,.22,9.8]],insideFitness:[[.10,.24,10.95],[.10,.24,12.55]],insideWT:[[-4.1,.04,0],[-10.4,.04,0]],insideMT:[[4.1,.04,0],[10.4,.04,0]]};
