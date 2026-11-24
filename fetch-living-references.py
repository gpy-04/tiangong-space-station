from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen,Request
import json
p=Path(__file__).parent/'references'
items={
 'living-dining-cctv.jpg':'https://p5.img.cntv.cn/photoworkspace/contentimg/2024/04/24/2024042412142152217.jpg',
 'living-sleep-cctv.jpg':'https://p5.img.cntv.cn/photoworkspace/contentimg/2024/04/24/2024042412192891376.jpg',
 'living-treadmill-cctv.jpg':'https://p5.img.cntv.cn/photoworkspace/contentimg/2024/04/24/2024042412261422224.jpg',
 'exhibit-berth.png':'https://pic.app2020.tjyun.com/006/019/262/00601926297_caa726d2.png',
 'exhibit-treadmill.png':'https://pic.app2020.tjyun.com/006/019/262/00601926296_8d6385f9.png',
 'exhibit-dining.png':'https://pic.app2020.tjyun.com/006/019/262/00601926294_c927ce76.png',
 'exhibit-berth-lights.png':'https://pic.app2020.tjyun.com/006/019/262/00601926298_bb667b5f.png',
 'exhibit-berth-storage.png':'https://pic.app2020.tjyun.com/006/019/262/00601926299_fd57449e.png',
 'exhibit-hygiene.png':'https://pic.app2020.tjyun.com/006/019/263/00601926300_a29afcc2.png',
}
def fetch(item):
 name,url=item
 try:
  b=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read();(p/name).write_bytes(b);return {'file':name,'url':url,'bytes':len(b)}
 except Exception as e:return {'file':name,'url':url,'error':str(e)}
with ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(fetch,items.items()))
(p/'living-downloads.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(results,ensure_ascii=False))
