import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {dependencies} from './tooling.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url)),stationRoot=path.dirname(dir),workspace=path.dirname(stationRoot);
const require=dependencies(),deps=path.dirname(path.dirname(require.resolve('esbuild/package.json')));
const esbuild=require('esbuild');
fs.mkdirSync(dir+'/assets',{recursive:true});
const liveLaunch=workspace+'/长征十号互动科普.html';
if(fs.existsSync(liveLaunch))fs.copyFileSync(liveLaunch,dir+'/assets/launch.html');
const launch=fs.readFileSync(dir+'/assets/launch.html','utf8');
const station=fs.readFileSync(stationRoot+'/index.html','utf8');
const result=await esbuild.build({entryPoints:[dir+'/main.js'],bundle:true,nodePaths:[deps],format:'iife',target:'es2022',minify:true,write:false,legalComments:'none'});
const font=fs.readFileSync(deps+'/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2').toString('base64');
const mono=fs.readFileSync(deps+'/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2').toString('base64');
const encode=x=>JSON.stringify(x).replace(/</g,'\\u003c');
const manifest=JSON.parse(fs.readFileSync(dir+'/photos.json','utf8'));
const photos=Object.fromEntries(Object.entries(manifest).map(([id,p])=>[id,{caption:p.caption,width:p.width,height:p.height,data:'data:image/webp;base64,'+fs.readFileSync(dir+'/'+p.file).toString('base64')}]));
let html=fs.readFileSync(dir+'/shell.html','utf8')
 .replace('/* HERO PHOTO */',()=>photos.station.data)
 .replace('/* FONTS */',()=>`@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font});font-weight:100 900;font-display:swap}@font-face{font-family:JetBrains;src:url(data:font/woff2;base64,${mono});font-display:swap}`)
 .replace('/* STYLES */',()=>fs.readFileSync(dir+'/style.css','utf8'))
 .replace('/* LAUNCH */',()=>encode(launch)).replace('/* STATION */',()=>encode(station))
 .replace('/* BRIDGE */',()=>encode(fs.readFileSync(dir+'/embed.js','utf8')))
 .replace('/* EMBED STYLES */',()=>encode(fs.readFileSync(dir+'/embed.css','utf8')))
 .replace('/* PHOTOS */',()=>encode(photos))
 .replace('/* APP */',()=>result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
const licenses=fs.readdirSync(dir+'/licenses').map(p=>fs.readFileSync(dir+'/licenses/'+p,'utf8')).join('\n\n');
html=html.replace('</head>',`<!-- Bundled software and font licenses\n${licenses.replace(/-->/g,'-- >')}\n--></head>`);
fs.writeFileSync(dir+'/index.html',html);
fs.writeFileSync(workspace+'/中国航天探索馆_三章合一.html',html);
console.log('单文件展馆：'+(Buffer.byteLength(html)/1024/1024).toFixed(2)+' MB');
