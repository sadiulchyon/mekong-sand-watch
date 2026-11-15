import {cpSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const out = path.join(root,'_site');
// Only this repository's generated build folder is replaced.
rmSync(out,{recursive:true,force:true});
mkdirSync(out,{recursive:true});
cpSync(path.join(root,'public'),out,{recursive:true});
writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Built the independent Mekong Sand Watch static site in _site/.');
