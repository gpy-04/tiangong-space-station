"""Deterministic ambient score. All accents read the film timeline."""
from pathlib import Path
import json,wave,numpy as np
p=Path(__file__).parent;tl=json.loads((p/'timeline.json').read_text());sr=48000;dur=tl['duration'];t=np.arange(sr*dur)/sr
left=np.zeros_like(t);right=np.zeros_like(t)
chords=[(65.406,97.999,130.812,164.814),(73.416,110,146.832,184.997),(65.406,97.999,146.832,195.998)]
for b,notes in enumerate(chords):
 start=b*12;end=min(dur,start+14);mask=(t>=start)&(t<end);u=t[mask]-start;env=np.minimum(1,u/2)*np.minimum(1,(end-start-u)/3)
 for i,f in enumerate(notes):
  a=np.sin(2*np.pi*f*u+.14*np.sin(u*.7+i))*.043*env
  left[mask]+=a*(.8 if i%2 else 1);right[mask]+=a*(1 if i%2 else .8)
for key,at in tl.items():
 if key in ('duration','fps'):continue
 mask=(t>=at)&(t<at+3);u=t[mask]-at;env=(1-np.exp(-u*9))*np.exp(-u*2)
 tone=(np.sin(2*np.pi*261.626*u)+.35*np.sin(2*np.pi*523.251*u))*.07*env
 left[mask]+=tone;right[mask]+=tone
fade=np.minimum(1,t/2)*np.minimum(1,(dur-t)/3);audio=np.stack((left*fade,right*fade),axis=-1)
audio=np.int16(np.clip(audio,-.9,.9)*32767)
with wave.open(str(p/'score.wav'),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(audio.tobytes())
print('36 s stereo ambient score, 48 kHz')
