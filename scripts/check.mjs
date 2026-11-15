import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {filterRecords,sortRecords,safeUrl,canonicalUrl,csv,normalize} from '../public/core.js';
import {focusedSearch,interleave,archiveSourceUrls} from '../collector/search-plan.mjs';
const root = fileURLToPath(new URL('../',import.meta.url));
const read = file => readFileSync(path.join(root,file),'utf8');
const archive = JSON.parse(read('public/data/archive.json'));
const config = JSON.parse(read('public/config.json'));
const records = archive.records;
assert.equal(archive.schemaVersion,1);
assert.ok(records.length > 0);
assert.equal(new Set(records.map(r => r.id)).size,records.length,'Duplicate record IDs');
assert.equal(new Set(records.map(r => canonicalUrl(r.url))).size,records.length,'Duplicate canonical source URLs');
const dois = records.map(r => r.doi.toLowerCase()).filter(Boolean);
assert.equal(new Set(dois).size,dois.length,'Duplicate DOIs');
for (const record of records) {
  assert.match(record.id,/^MSW-\d+$/);
  for (const key of ['title','publisher','authors','category','dateKind','dateEvidence','studyPeriod','location','language','url','summary','limitations','retrieval','retrievedAt','editorialStatus']) assert.ok(typeof record[key] === 'string' && record[key].trim(),`${record.id}: missing ${key}`);
  assert.ok(config.categories.includes(record.category));
  for (const key of ['countries','rivers','topics']) assert.ok(Array.isArray(record[key]) && record[key].length,`${record.id}: missing ${key}`);
  assert.ok(record.countries.every(country => config.countries.includes(country)));
  assert.ok(record.rivers.every(river => config.rivers.includes(river)));
  assert.ok(safeUrl(record.url));
  for (const merged of record.mergedLocalRecords || []) {
    assert.match(merged.originalLocalId, /^MSW-\d+$/);
    assert.ok(safeUrl(merged.url) && merged.summary && merged.limitations, `${record.id}: incomplete merged source review`);
  }
  if (record.date !== null) {
    assert.match(record.date,/^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(record.date + 'T12:00:00Z').toISOString().slice(0,10),record.date,'Invalid date');
  } else assert.match(record.dateKind,/unverified/i);
}
const pilot = records.filter(r => ['MSW-001','MSW-002','MSW-003','MSW-004'].includes(r.id));
const ids = filters => filterRecords(pilot,filters).map(r => r.id).sort();
assert.deepEqual(ids({country:'Cambodia'}),['MSW-002']);
assert.deepEqual(ids({country:'China'}),[]);
assert.deepEqual(ids({country:'Viet Nam',river:'Tien',category:'Research'}),['MSW-001','MSW-002']);
assert.deepEqual(ids({search:'Việt Nam'}),ids({search:'Vietnam'}));
assert.equal(normalize('Tiền Hậu Laos'),'tien hau lao pdr');
assert.deepEqual(ids({year:'undated'}),['MSW-003','MSW-004']);
assert.deepEqual(ids({dateFrom:'2019-01-01',dateTo:'2019-12-31'}),['MSW-001']);
assert.deepEqual(ids({dateFrom:'2020-01-01',dateTo:'2019-01-01'}),[]);
assert.deepEqual(ids({search:'not in the archive xyz'}),[]);
assert.equal(filterRecords([{...pilot[0],mergedLocalRecords:[{title:'Unique alternate source trail',url:'https://example.org',summary:'Preserved review',doi:''}]}],{search:'unique alternate'}).length,1);
for (const sort of ['newest','oldest']) assert.ok(sortRecords(records,sort).slice(-2).every(r => !r.date));
assert.equal(safeUrl('javascript:alert(1)'),'');
assert.equal(canonicalUrl('https://example.org/a?utm_source=test#ref'),'https://example.org/a');
assert.ok(csv([['=SUM(A1:A2)',' \t@bad','quote " inside']]).includes('"\'=SUM(A1:A2)"'));
assert.ok(csv([['=SUM(A1:A2)',' \t@bad','quote " inside']]).includes('"\' \t@bad"'));
assert.deepEqual(interleave([['a1','a2'],['b1'],[],['d1','d2']]),['a1','b1','d1','a2','d2']);
assert.equal(new Set(Array.from({length:5},(_,i)=>focusedSearch(i))).size,5);
assert.equal(focusedSearch(0),focusedSearch(5));
assert.deepEqual([...archiveSourceUrls([{url:'https://example.org/main',mergedLocalRecords:[{url:'https://example.org/alternate?utm_source=review'}]}],canonicalUrl)],['https://example.org/main','https://example.org/alternate']);
const html = read('public/index.html');
const idsInHtml = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(idsInHtml.length,new Set(idsInHtml).size,'Duplicate HTML IDs');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (/^https?:/.test(match[1])) continue;
  assert.ok(existsSync(path.join(root,'public',match[1].split(/[?#]/)[0])),`Missing asset ${match[1]}`);
}
for (const match of read('public/app.js').matchAll(/\$\('#([\w-]+)'\)/g)) assert.ok(idsInHtml.includes(match[1]),`Missing DOM target ${match[1]}`);
for (const file of ['public/app.js','public/core.js','public/insights.js','public/country-shapes.js',...readdirSync(path.join(root,'scripts')).filter(f => f.endsWith('.mjs')).map(f => 'scripts/'+f)]) execFileSync(process.execPath,['--check',path.join(root,file)]);
const workflow = read('.github/workflows/pages.yml');
assert.ok(!workflow.includes('schedule:') && !workflow.includes('cron:'),'No recurring collection schedule belongs in this pilot');
assert.ok(!existsSync(path.join(root,'.openai/hosting.json')),'Do not inherit the original hosted Site identity');
assert.ok(!existsSync(path.join(root,'cloudflare')),'Do not inherit production database bindings');
console.log(`Passed: ${records.length} source-backed records; country/river/topic filters, aliases, date boundaries, undated sorting, URL/DOI uniqueness, CSV safety, syntax, DOM targets, assets, and isolated deployment.`);
