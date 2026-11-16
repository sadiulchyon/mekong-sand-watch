"""Extract the Mekong outline from the World Bank Major River Basins dataset.

Requires pyshp. Download and extract the World Bank dataset, then run:
python3 scripts/build-basin-shape.py /path/to/Major_Basins_of_the_World.shp
Source: https://datacatalog.worldbank.org/search/dataset/0041426/major-river-basins-of-the-world
World Bank dataset CC BY 4.0; modified by selecting Mekong and converting to SVG.
The equirectangular regional projection matches build-country-shapes.py.
"""
import hashlib
import json
import sys
from pathlib import Path

import shapefile
source = Path(sys.argv[1])
assert hashlib.sha256(source.read_bytes()).hexdigest() == 'f11e2492881c9a7cfc228dd468d834945e334dc08adc24f985839e26bc5fa6cf'
reader = shapefile.Reader(str(source))
features = [f for f in reader.iterShapeRecords() if f.record.as_dict().get('NAME') == 'Mekong']
assert len(features) == 1 and features[0].record.as_dict()['ID'] == 442
shape = features[0].shape
parts = list(shape.parts) + [len(shape.points)]
paths = []
for start, end in zip(parts, parts[1:]):
    coords = [(round((lon - 90) * 20, 1), round((35 - lat) * 20, 1)) for lon, lat in shape.points[start:end]]
    paths.append('M' + ' L'.join(f'{x},{y}' for x, y in coords) + ' Z')
Path('public/basin-shape.js').write_text('// World Bank Major River Basins of the World (CC BY 4.0); simplified by rounding, Mekong polygon selected.\nexport const basinShape = ' + json.dumps(' '.join(paths)) + ';\n')
