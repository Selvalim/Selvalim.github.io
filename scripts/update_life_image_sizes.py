"""Cache image dimensions without modifying original images. Requires Pillow."""
import json
from PIL import Image
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sizes = {}
for path in sorted((root / 'images/life').iterdir()):
    if path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp'}:
        continue
    with Image.open(path) as image:
        width, height = image.size
    sizes['/' + path.relative_to(root).as_posix()] = dict(width=width, height=height)
(root / '_data/life_image_sizes.json').write_text(json.dumps(sizes, indent=2) + '\n')
print(f'Cached dimensions for {len(sizes)} original photos.')
