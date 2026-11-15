"""Build the small interactive country overview from Natural Earth 1:110m v5.1.2.

Usage: python3 scripts/build-country-shapes.py /path/to/ne_110m_admin_0_countries.geojson
Source: https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson
Natural Earth data are public domain: https://www.naturalearthdata.com/about/terms-of-use/
The viewport is a geographic context window, not a Mekong basin boundary.
"""
import hashlib,json,sys
from pathlib import Path
payload=Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(payload).hexdigest()=='6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f'
names={'China':'China','Myanmar':'Myanmar','Laos':'Lao PDR','Thailand':'Thailand','Cambodia':'Cambodia','Vietnam':'Viet Nam'}
features=json.loads(payload)['features'];out={}
for feature in features:
 name=names.get(feature['properties']['ADMIN'])
 if not name:continue
 geometry=feature['geometry'];polygons=[geometry['coordinates']] if geometry['type']=='Polygon' else geometry['coordinates'];parts=[]
 for polygon in polygons:
  points=[p for ring in polygon for p in ring]
  if max(p[0] for p in points)<90 or min(p[0] for p in points)>114 or max(p[1] for p in points)<8 or min(p[1] for p in points)>35:continue
  for ring in polygon:
   coords=[(round((lon-90)*20,1),round((35-lat)*20,1)) for lon,lat in ring]
   parts.append('M'+' L'.join(f'{x},{y}' for x,y in coords)+' Z')
 out[name]=' '.join(parts)
assert set(out)==set(names.values())
Path('public/country-shapes.js').write_text('// Natural Earth 1:110m country boundaries, v5.1.2; public domain.\nexport const countryShapes = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
