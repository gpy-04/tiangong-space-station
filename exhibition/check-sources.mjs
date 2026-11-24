import fs from 'node:fs';
import {HISTORY} from './history.js';
const sources=[...new Map(HISTORY.flatMap(d=>[d.source,...(d.relatedSources||[])]).map(s=>[s[1],s])).values()],results=[];
let cursor=0;
const normalize=s=>s.normalize('NFKC').replace(/\s+/g,'');
await Promise.all(Array.from({length:4},async()=>{while(cursor<sources.length){const[name,url]=sources[cursor++];let result;
 for(let attempt=1;attempt<=3;attempt++)try{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0'}}),buffer=await response.arrayBuffer(),content=new TextDecoder('utf-8').decode(buffer),title=content.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const text=normalize(content.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,''));
  const events=HISTORY.filter(d=>d.source[1]===url||d.relatedSources?.some(s=>s[1]===url)).map(d=>{const[y,m,day]=d.date.split('.').map(Number),date=`${y}年${m}月${day}日`;return{id:d.id,date:d.date,fullDateFound:text.includes(date)||text.includes(d.date.replaceAll('.','-')),monthDayFound:text.includes(`${m}月${day}日`),name:d.name}});
  result={name,url,status:response.status,title,bytes:buffer.byteLength,attempt,events};if(response.ok)break;
 }catch(e){result={name,url,attempt,error:e.message}}
 results.push(result);console.log(result.status||'ERROR',name,result.title||result.error)
}}));
const output={checked:new Date().toISOString(),passed:results.every(r=>r.status===200&&!/404|not found|未找到/i.test(r.title||'')),sourceCount:sources.length,sources:results};
fs.writeFileSync(new URL('source-validation.json',import.meta.url),JSON.stringify(output,null,2));console.log('Sources checked:',sources.length,'passed:',output.passed);if(!output.passed)process.exitCode=1;
