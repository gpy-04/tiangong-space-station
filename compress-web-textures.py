"""Rebuild embedded WebP Earth assets from the retained source images."""
from pathlib import Path
import base64
from PIL import Image

root = Path(__file__).resolve().parent
assets = root / 'assets'
settings = [
    ('earth-day-8k.jpg', 'earth-web.webp', (8192, 4096), 90),
    ('earth-clouds-8k.jpg', 'clouds-web.webp', (4096, 2048), 82),
]
for source, target, size, quality in settings:
    image = Image.open(assets / source).convert('RGB')
    if image.size != size:
        image = image.resize(size, Image.Resampling.LANCZOS)
    image.save(assets / target, 'WEBP', quality=quality, method=6)

def data(name):
    return 'data:image/webp;base64,' + base64.b64encode((assets / name).read_bytes()).decode('ascii')

(root / 'textures.js').write_text(
    'export const earthURL=' + repr(data('earth-web.webp')) + ';\n'
    'export const cloudURL=' + repr(data('clouds-web.webp')) + ';\n',
    encoding='utf-8',
)
print('Rebuilt embedded 8K Earth / 4K cloud WebP textures.')
