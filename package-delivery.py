from pathlib import Path
import zipfile,hashlib,json
p=Path(__file__).parent
required=['index.html','中国空间站_三舱与舱内设施.glb','中国空间站_精细可编辑.blend','中国空间站_结构导览_60fps.mp4']
for f in required:
 assert (p/f).stat().st_size>1000,f
assert (p/'index.html').read_bytes()==(p.parent/'中国空间站_交互图鉴.html').read_bytes(),'Desktop page differs from index.html'
for name in ['connection-inspection.json','free-camera-validation.json','hatch-closure-validation.json','lab-learning-validation.json','living-clearance-audit.json','validation-report.json','final-material-check.json']:
 report=json.loads((p/name).read_text(encoding='utf-8'))
 assert report.get('passed') is True,name
 assert not report.get('errors'),name
final_performance=json.loads((p/'performance-final.json').read_text(encoding='utf-8'))
assert final_performance['htmlBytes']==(p/'index.html').stat().st_size,'Performance report is stale'
assert not final_performance['errors']
manifest={f:{'bytes':(p/f).stat().st_size,'sha256':hashlib.sha256((p/f).read_bytes()).hexdigest()} for f in required}
(p/'交付清单.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
excluded={'performance-before.json','performance-after.json','living-validation-report.json'}
files=[f for f in p.iterdir() if f.is_file() and f.name not in excluded and (f.suffix in ['.js','.mjs','.py','.css','.md','.json','.glb','.blend'] or f.name in ['index.html','embed.html','中国空间站_结构导览_60fps.mp4','video-metadata.txt','score.wav'])]
files+=list((p/'licenses').rglob('*'))+list((p/'references').rglob('*'))
assets=['earth-day-8k.jpg','earth-clouds-8k.jpg','earth-web.webp','clouds-web.webp','thermal-color.jpg','thermal-normal.jpg','thermal-roughness.jpg','thermal-ao.jpg','foil-normal.jpg']
files+=[p/'assets'/f for f in assets]
captures=['free-insideCore.png','free-insideLife.png','free-insideWT.png','free-insideMT.png','free-mobile.png','生活区修订预览.jpg','living-mobile-health.png','living-insideLife.png','living-insideBerth.png','living-insideGalley.png','living-insideFitness.png','living-reference-board.jpg','living-insideHealth.png','final-overview.png','final-insideWT.png','final-insideMT.png','final-insideCore.png','final-xray.png','final-exploded.png','final-wentian-cutaway.png','final-thermal-closeup.png','final-mobile.png','final-film-review.png','encoded-film-review.jpg']
files+=[p/'captures'/f for f in captures]
files+=list((p/'captures').glob('hatch-sealed-*.png'))
files+=list((p/'captures').glob('lab-*.png'))
files+=list((p/'captures').glob('joint-core-*.png'))+list((p/'captures').glob('joint-mengtian-*.png'))+list((p/'captures').glob('joint-wentian-*.png'))+list((p/'captures').glob('joint-aft-*.png'))
files+=[p/'.gitattributes',p/'.gitignore']
out=p.parent/'中国空间站_模型网页与动画.zip'
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 z.write(p.parent/'中国空间站_交互图鉴.html','中国空间站项目/中国空间站_交互图鉴.html')
 for f in files:
  if f.is_file():z.write(f,'中国空间站项目/tiangong/'+f.relative_to(p).as_posix())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 print(json.dumps({'archive':str(out),'bytes':out.stat().st_size,'files':len(z.namelist()),'integrity':'passed'},ensure_ascii=False))
