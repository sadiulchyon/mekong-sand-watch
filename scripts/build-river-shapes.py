"""Build a regional river overlay from Natural Earth 1:10m v5.1.2.

Usage: python3 scripts/build-river-shapes.py /path/to/ne_10m_rivers_lake_centerlines.geojson
Source: https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson
Natural Earth data are public domain. Projection matches build-country-shapes.py.
"""
import hashlib
import json
import sys
from pathlib import Path

payload = Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(payload).hexdigest() == 'bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a'
selected = {'Lancang': 'main', 'Mekong': 'main', 'Tonle Sap': 'tributary', 'Srepok': 'tributary', 'Mun': 'tributary', 'Chi': 'tributary'}
out = {'main': [], 'tributary': []}
for feature in json.loads(payload)['features']:
    kind = selected.get(feature['properties'].get('name'))
    if not kind:
        continue
    geometry = feature['geometry']
    lines = [geometry['coordinates']] if geometry['type'] == 'LineString' else geometry['coordinates']
    for line in lines:
        coords = [(round((lon - 90) * 20, 1), round((35 - lat) * 20, 1)) for lon, lat, *_ in line]
        out[kind].append('M' + ' L'.join(f'{x},{y}' for x, y in coords))
assert len(out['main']) == 8 and len(out['tributary']) == 8
Path('public/river-shapes.js').write_text('// Natural Earth 1:10m rivers and lake centerlines v5.1.2; public domain.\nexport const riverShapes = ' + json.dumps({k:' '.join(v) for k,v in out.items()}, separators=(',', ':')) + ';\n')
