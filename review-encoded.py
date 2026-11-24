from pathlib import Path
from PIL import Image,ImageDraw
import subprocess,json
p=Path(__file__).parent
ffmpeg=p.parent/'drone-games/output/media-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe'
movie=p/'中国空间站_结构导览_60fps.mp4'
folder=p/'captures/encoded-frames';folder.mkdir(exist_ok=True)
times=[0,6,10,16,19.5,21,26,31,35]
sheet=Image.new('RGB',(2560,1080),'#15212b')
for i,t in enumerate(times):
 frame=folder/f'{i:03}.png'
 subprocess.run([str(ffmpeg),'-y','-hide_banner','-loglevel','error','-ss',str(t),'-i',str(movie),'-frames:v','1',str(frame)],check=True)
 image=Image.open(frame).convert('RGB');assert image.size==(1920,1080)
 tile=image.resize((640,360),Image.Resampling.LANCZOS);draw=ImageDraw.Draw(tile);draw.rectangle((540,8,633,32),fill='#090f16');draw.text((550,14),f't={t:.2f}s',fill='white')
 sheet.paste(tile,((i%4)*640,(i//4)*360))
sheet.save(p/'captures/encoded-film-review.jpg',quality=94)
info=subprocess.run([str(ffmpeg),'-hide_banner','-i',str(movie)],capture_output=True,text=True,encoding='utf8',errors='replace').stderr
(p/'video-metadata.txt').write_text(info,encoding='utf8')
assert '1920x1080' in info and '60 fps' in info and 'Audio: aac' in info
print(info)
print('Encoded film contact sheet created; 1920x1080 / 60 fps / AAC confirmed.')
