from pathlib import Path
import numpy as np
from PIL import Image,ImageFilter
import base64
p=Path(__file__).parent/'assets';rng=np.random.default_rng(20231127);n=1024
y,x=np.mgrid[0:1:complex(n),0:1:complex(n)];height=np.zeros((n,n),np.float32)
# Folded thermal cover. The folds own the normals; diffuse carries no baked specular.
for i in range(85):
 a=rng.uniform(0,np.pi*2);cx,cy=rng.uniform(-.1,1.1,2);width=rng.uniform(.0012,.006)
 d=(x-cx)*np.cos(a)+(y-cy)*np.sin(a);u=-(x-cx)*np.sin(a)+(y-cy)*np.cos(a)
 taper=np.exp(-(u/rng.uniform(.04,.3))**4)
 height+=(np.exp(-(d/width)**2)*rng.uniform(.00013,.00065)*taper)*(-1 if i%4==0 else 1)
# Centimetre-wide folds in a two-metre repeat. Keep the broad folds in
# the shared height field rather than painting highlights into the colour.
height*=7
height+=.000045*np.sin(x*n*2*np.pi/4)*np.sin(y*n*2*np.pi/4)
dy,dx=np.gradient(height,2/n,2/n);norm=np.dstack((-dx,dy,np.ones_like(dx)));norm/=np.linalg.norm(norm,axis=2)[:,:,None]
normal=np.uint8(np.clip((norm*.5+.5)*255,0,255));Image.fromarray(normal).save(p/'thermal-normal.jpg',quality=94)
noise=rng.normal(0,.8,(n,n));base=np.full((n,n,3),216,dtype=np.float32);base+=noise[:,:,None]
seam=(np.minimum(x%0.5,.5-x%0.5)<.003)|(np.minimum(y%0.5,.5-y%0.5)<.003)
base[seam]=193
stitch=seam&(((x+y)*n//7)%2==0);base[stitch]=172
Image.fromarray(np.uint8(np.clip(base,0,255))).save(p/'thermal-color.jpg',quality=91)
rough=np.clip(222+np.abs(height)*2200+rng.normal(0,2,(n,n)),205,244);Image.fromarray(np.uint8(rough)).save(p/'thermal-roughness.jpg',quality=87)
ao=np.full((n,n),255,dtype=np.uint8);ao[seam]=190;Image.fromarray(ao).filter(ImageFilter.GaussianBlur(1.4)).save(p/'thermal-ao.jpg',quality=90)
foil=np.dstack((-dx*1.8,dy*1.8,np.ones_like(dx)));foil/=np.linalg.norm(foil,axis=2)[:,:,None]
Image.fromarray(np.uint8(np.clip((foil*.5+.5)*255,0,255))).save(p/'foil-normal.jpg',quality=94)
def data(name):return 'data:image/jpeg;base64,'+base64.b64encode((p/name).read_bytes()).decode()
out="export const thermalColorURL="+repr(data('thermal-color.jpg'))+";\nexport const thermalNormalURL="+repr(data('thermal-normal.jpg'))+";\nexport const thermalRoughnessURL="+repr(data('thermal-roughness.jpg'))+";\n"
out+="export const thermalAOURL="+repr(data('thermal-ao.jpg'))+";\nexport const foilNormalURL="+repr(data('foil-normal.jpg'))+";\n"
(p.parent/'thermal-textures.js').write_text(out,encoding='utf8')
print('Created thermal cover PBR maps')
