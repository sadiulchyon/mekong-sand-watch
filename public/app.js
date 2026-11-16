import {filterRecords, sortRecords, safeUrl, csv, dateLabel} from './core.js?v=20261115-5';
import {renderInsights} from './insights.js?v=20261115-basin1';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fields = ['country','river','category','topic','publisher','year','language','dateFrom','dateTo'];
let config, archive, visible = [], lastRecordButton, limit = 40;
const unique = values => [...new Set(values)].sort((a,b) => a.localeCompare(b));
const riverLabel = river => river === 'Mekong' ? 'Mekong basin (including tributaries)' : river;
function options(id, values, label = value => value) {
  const select = $('#'+id);
  for (const value of values) select.add(new Option(label(value), value));
}
function currentFilters() {
  return {search:$('#search').value, ...Object.fromEntries(fields.map(key => [key, $('#'+key).value]))};
}
function render(resetLimit = true) {
  if (!archive) return;
  if (resetLimit) limit = 40;
  const filters = currentFilters();
  visible = sortRecords(filterRecords(archive.records, filters), $('#sort').value);
  const dateRangeInvalid = filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo;
  $('#results-count').textContent = dateRangeInvalid ? 'The start date is after the end date.' : `${visible.length} matching records · showing ${Math.min(limit, visible.length)} (${archive.records.length} total)`;
  const active = fields.filter(key => filters[key] && filters[key] !== 'all').length;
  $('#filter-count').textContent = active ? String(active) : '';
  document.querySelectorAll('[data-country]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.country === filters.country)));
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === filters.category)));
  $('#records').innerHTML = visible.slice(0, limit).map(record => `<article class="record">
    <div class="record-meta"><span class="type ${esc(record.category.toLowerCase())}">${esc(record.category)}</span><time${record.date ? ` datetime="${esc(record.date)}"` : ''}>${esc(dateLabel(record))}</time><span class="record-id">${esc(record.id)}</span></div>
    <div><h3><button class="record-title" data-record="${esc(record.id)}">${esc(record.title)}</button></h3><p class="record-publisher">${esc(record.publisher)} <span aria-hidden="true">·</span> ${esc(record.retrieval)}</p><p class="record-summary">${esc(record.summary)}</p><div class="record-tags">${record.countries.map(country => `<span class="tag location">${esc(country)}</span>`).join('')}${record.rivers.filter(river => river !== 'Mekong').map(river => `<span class="tag">${esc(river)}</span>`).join('')}${record.topics.slice(0,2).map(topic => `<span class="tag">${esc(topic)}</span>`).join('')}</div></div>
    <button class="record-open" data-record="${esc(record.id)}" aria-label="Open record ${esc(record.id)}">↗</button>
  </article>`).join('');
  $('#empty').hidden = visible.length !== 0;
  $('#more').hidden = visible.length <= limit;
  $('#more').textContent = `Show more (${Math.max(0, visible.length-limit)} remaining)`;
  $('#empty-text').textContent = filters.country !== 'all' && !archive.records.some(r => r.countries.includes(filters.country)) ? `No ${filters.country} records have been added to this archive. This is a coverage gap, not evidence that extraction is absent.` : 'Try a broader search or reset the filters.';
  $('#export-csv').disabled = visible.length === 0;
}
function reset() {
  fields.forEach(key => $('#'+key).value = ['dateFrom','dateTo'].includes(key) ? '' : 'all');
  $('#search').value = ''; $('#hero-search').value = ''; render();
}
function detail(record, button) {
  lastRecordButton = button;
  const info = [
    ...(record.originalTitle && record.originalTitle !== record.title ? [['Original headline',record.originalTitle]] : []),
    ['Countries',record.countries.join(' · ')], ['River / system',record.rivers.map(riverLabel).join(' · ')],
    ['Location / scope',record.location], ['Source date',`${dateLabel(record)} · ${record.dateKind}`],
    ['Observation / project period',record.studyPeriod], ['Date evidence',record.dateEvidence],
    ['Source language',record.language], ['Source read',`${record.retrievedAt} · ${record.retrieval}`],
    ['DOI',record.doi || 'Not applicable / not recorded'], ['Topics',record.topics.join(' · ')]
  ];
  const mergedDetails = (record.mergedLocalRecords || []).map(source => `<details class="merged-source"><summary>Additional local source review${source.url !== record.url ? ' and source link' : ''}</summary><p>${esc(source.summary)}</p><p><strong>Limitations:</strong> ${esc(source.limitations)}</p>${source.dateConflictNote ? `<p><strong>Date reconciliation:</strong> ${esc(source.dateConflictNote)}</p>` : ''}${source.url !== record.url ? `<a href="${esc(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">Read the additional source ↗</a>` : ''}</details>`).join('');
  $('#record-detail').innerHTML = `<span class="type ${esc(record.category.toLowerCase())}">${esc(record.category)} / ${esc(record.id)}</span><h2 class="detail-title" id="detail-title">${esc(record.title)}</h2><p class="detail-publisher">${esc(record.publisher)} · ${esc(record.authors)}</p><p class="detail-summary">${esc(record.summary)}</p><div class="detail-limit"><strong>How to interpret this source</strong><p>${esc(record.limitations)}</p></div><dl class="detail-grid">${info.map(([label,value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p class="detail-status">${esc(record.editorialStatus)}. ${record.titleTranslation ? esc(record.titleTranslation) + '. ' : ''}Inclusion does not independently verify the source’s claims.</p>${mergedDetails}<a class="button detail-source" href="${esc(safeUrl(record.url))}" target="_blank" rel="noopener noreferrer">Read the original source ↗</a>`;
  $('#record-dialog').showModal(); $('#close-dialog').focus();
}
function exportCsv() {
  const columns = ['id','title','originalTitle','publisher','authors','category','date','dateKind','studyPeriod','countries','rivers','location','topics','language','url','doi','summary','limitations','retrieval','retrievedAt','dateEvidence','editorialStatus','additionalSourceUrls'];
  const rows = [columns, ...visible.map(record => columns.map(key => key === 'additionalSourceUrls' ? (record.mergedLocalRecords || []).map(source => source.url).join('; ') : Array.isArray(record[key]) ? record[key].join('; ') : record[key]))];
  const url = URL.createObjectURL(new Blob([csv(rows)], {type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a'); a.href = url; a.download = `${config.slug}-records.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#toast').textContent = `Exported ${visible.length} records with source links and limitations`; $('#toast').hidden = false;
  setTimeout(() => $('#toast').hidden = true, 4000);
}
function renderCoverage() {
  const records = archive.records;
  $('#total-records').textContent = records.length;
  $('#total-research').textContent = records.filter(r => r.category === 'Research').length;
  $('#total-countries').textContent = new Set(records.flatMap(r => r.countries)).size;
  $('#total-sources').textContent = unique(records.map(r => r.url)).length;
  $('#pilot-date').textContent = `Archive updated ${dateLabel({date:archive.updated})} · ${archive.runs.some(r => r.kind === 'Automated daily collection') ? 'daily collection' : 'daily collection scheduled · first live run pending'}`;
  const counts = config.countries.map(country => ({country, count:records.filter(r => r.countries.includes(country)).length}));
  const categoryNames = {Research:'Research papers & theses', Project:'Research projects', News:'News reports', Official:'Official documents', Context:'Context & analysis'};
  $('#category-tabs').innerHTML = [{category:'all',label:'All sources',count:records.length}, ...config.categories.map(category => ({category,label:categoryNames[category] || category,count:records.filter(r => r.category === category).length}))].map(item => `<button type="button" class="category-tab" data-category="${esc(item.category)}" aria-pressed="${item.category === 'all'}"><strong>${item.count}</strong><span>${esc(item.label)}</span></button>`).join('');
  renderInsights($('#insights'), records, pickInsight);
  $('#country-tabs').innerHTML = [{country:'all',count:records.length}, ...counts].map(item => `<button class="country-tab" data-country="${esc(item.country)}" aria-pressed="${item.country === 'all'}">${esc(item.country === 'all' ? 'All basin' : item.country)}<small>${item.count}</small></button>`).join('');
  $('#country-bars').innerHTML = counts.map(({country,count}) => `<div class="country-bar"><span class="${count ? '' : 'zero'}">${esc(country)}</span><div class="bar-track"><div class="bar-fill" style="width:${count / records.length * 100}%"></div></div><strong>${count}</strong></div>`).join('');
  $('#category-bars').innerHTML = config.categories.map(category => `<div class="category-row"><span>${esc(category)}</span><strong>${records.filter(r => r.category === category).length}</strong></div>`).join('');
  $('#source-rows').innerHTML = archive.sources.map(source => `<tr><td><a href="${esc(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.name)} ↗</a><br><span class="source-language">${esc(source.languages.join(' · '))}</span></td><td>${esc(source.kind)}</td><td><span class="source-status ${source.status === 'Planned' ? '' : 'read'}">${esc(source.status)}</span></td><td>${esc(source.note)}</td></tr>`).join('');
  $('#registry-count').textContent = `${archive.sources.length} sources · ${archive.sources.filter(s => s.status !== 'Planned').length} with a selected page read`;
  $('#runs').innerHTML = archive.runs.map(run => `<p class="run-entry"><strong>${esc(dateLabel({date:run.date}))} · ${esc(run.kind)} · ${run.added} records</strong><br>${esc(run.note)}</p>`).join('');
  $('#scope-note').textContent = config.scopeNote;
  $('#repository-link').href = safeUrl(config.repositoryUrl);
}
function setView(view) {
  const isInsights = view === 'insights';
  document.querySelector('.hero').hidden = isInsights;
  $('#archive').hidden = isInsights; $('#coverage').hidden = isInsights; $('#method').hidden = isInsights;
  $('#insights').hidden = !isInsights;
  document.querySelectorAll('.masthead [data-view]').forEach(link => link.setAttribute('aria-current', link.dataset.view === view && (isInsights || link.getAttribute('href') === '#archive') ? 'page' : 'false'));
}
function pickInsight(filter, value) {
  reset(); $('#'+filter).value = value; setView('archive'); render();
  history.replaceState(null, '', '#archive'); $('#archive').scrollIntoView({behavior:'smooth'}); $('#archive-title').focus({preventScroll:true});
}
document.addEventListener('click', event => {
  const nav = event.target.closest('.masthead [data-view]');
  if (nav) { setView(nav.dataset.view); }
  else if (event.target.closest('a[href="#home"], a[href="#archive"], a[href="#coverage"], a[href="#method"], a[href="#sources"]')) { setView('archive'); }
  const category = event.target.closest('[data-category]');
  if (category) { $('#category').value = category.dataset.category; render(); }
  const recordButton = event.target.closest('[data-record]');
  if (recordButton) { const record = archive?.records.find(r => r.id === recordButton.dataset.record); if (record) detail(record,recordButton); }
  const countryButton = event.target.closest('[data-country]');
  if (countryButton) { $('#country').value = countryButton.dataset.country; render(); }
});
fields.forEach(key => $('#'+key).addEventListener('change', render));
$('#search').addEventListener('input', render); $('#sort').addEventListener('change', render);
$('#reset').addEventListener('click', reset); $('#empty-reset').addEventListener('click', reset);
$('#filters').addEventListener('submit', event => event.preventDefault());
$('#filter-toggle').addEventListener('click', () => {
  const open = $('#filters').hidden; $('#filters').hidden = !open; $('#filter-toggle').setAttribute('aria-expanded', String(open));
});
$('#hero-form').addEventListener('submit', event => {event.preventDefault(); $('#search').value = $('#hero-search').value; render(); $('#archive').scrollIntoView({behavior:'smooth'}); $('#search').focus({preventScroll:true});});
$('#close-dialog').addEventListener('click', () => $('#record-dialog').close());
$('#record-dialog').addEventListener('close', () => {if(lastRecordButton?.isConnected) lastRecordButton.focus({preventScroll:true});});
$('#record-dialog').addEventListener('click', event => {
  if (event.target !== $('#record-dialog')) return;
  const rect = event.target.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
});
$('#export-csv').addEventListener('click', exportCsv);
$('#more').addEventListener('click', () => {limit += 40; render(false);});
document.addEventListener('keydown', event => {if (event.key === '/' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName) && !$('#record-dialog').open) {event.preventDefault(); $('#search').focus();}});
async function init() {
  try {
    const responses = await Promise.all([fetch('config.json',{cache:'no-store'}),fetch('data/archive.json',{cache:'no-store'})]);
    if (responses.some(response => !response.ok)) throw new Error('Data request failed');
    [config,archive] = await Promise.all(responses.map(response => response.json()));
    if (archive.schemaVersion !== 1 || !Array.isArray(archive.records) || !archive.records.length) throw new Error('Unsupported archive');
    options('country',config.countries); options('river',unique([...config.rivers,...archive.records.flatMap(r => r.rivers)]),riverLabel);
    options('category',config.categories); options('topic',unique(archive.records.flatMap(r => r.topics)));
    options('publisher',unique(archive.records.map(r => r.publisher))); options('language',unique(archive.records.map(r => r.language)));
    options('year',unique(archive.records.filter(r => r.date).map(r => r.date.slice(0,4))).reverse()); options('year',['undated'],() => 'Publication date unverified');
    renderCoverage(); render(); if (location.hash === '#insights') setView('insights');
  } catch (error) {$('#load-error').hidden = false; $('#results-count').textContent = 'Archive unavailable'; console.error('Archive could not be loaded:',error.message);}
}
window.addEventListener('hashchange', () => setView(location.hash === '#insights' ? 'insights' : 'archive'));
init();
