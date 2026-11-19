import {filterRecords, sortRecords, safeUrl, csv, dateLabel, normalize} from './core.js?v=20261115-5';
import {renderInsights} from './insights.js?v=20261116-sand2';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const number = value => Number(value).toLocaleString('en');
const fields = ['country','river','category','topic','publisher','year','language','dateFrom','dateTo'];
const chipLabels = {country:'Country', river:'River', category:'Type', topic:'Topic', publisher:'Publisher', year:'Year', language:'Language', dateFrom:'From', dateTo:'Through'};
const categoryNames = {Research:'Research papers & theses', Project:'Research projects', News:'News reports', Official:'Official documents', Context:'Context & analysis'};
let config, archive, visible = [], lastRecordButton, limit = 40;
let view = 'archive', section = 'archive';
const unique = values => [...new Set(values)].sort((a,b) => a.localeCompare(b));
const riverLabel = river => river === 'Mekong' ? 'Mekong basin (including tributaries)' : river;
function options(id, values, label = value => value) {
  const select = $('#'+id);
  for (const value of values) select.add(new Option(label(value), value));
}
function currentFilters() {
  return {search:$('#search').value, ...Object.fromEntries(fields.map(key => [key, $('#'+key).value]))};
}
function activeChips(filters) {
  const chips = [];
  if (filters.search.trim()) chips.push(['search', `“${filters.search.trim()}”`]);
  for (const key of fields) {
    const value = filters[key];
    if (!value || value === 'all') continue;
    chips.push([key, `${chipLabels[key]}: ${key === 'year' && value === 'undated' ? 'date unverified' : value}`]);
  }
  return chips;
}
function render(resetLimit = true) {
  if (!archive) return;
  if (resetLimit) limit = 40;
  const filters = currentFilters();
  visible = sortRecords(filterRecords(archive.records, filters), $('#sort').value);
  const total = archive.records.length, shown = Math.min(limit, visible.length);
  const dateRangeInvalid = filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo;
  const chips = activeChips(filters);
  $('#results-count').innerHTML = dateRangeInvalid ? 'The start date is after the end date.'
    : `${chips.length ? `<strong>${number(visible.length)}</strong> of ${number(total)} records match` : `<strong>${number(total)}</strong> records`}${visible.length > shown ? ` · showing the first ${shown}` : ''}`;
  const active = fields.filter(key => filters[key] && filters[key] !== 'all').length;
  $('#filter-count').textContent = active ? String(active) : '';
  $('#active-filters').hidden = !chips.length;
  $('#active-filters').innerHTML = chips.map(([key,label]) => `<button type="button" class="filter-chip" data-clear="${key}" aria-label="Remove filter ${esc(label)}">${esc(label)}${icon('x')}</button>`).join('') + (chips.length > 1 ? '<button type="button" class="text-button" data-clear="all">Clear all</button>' : '');
  document.querySelectorAll('[data-country]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.country === filters.country)));
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === filters.category)));
  $('#records').innerHTML = visible.slice(0, limit).map(record => `<article class="record">
    <div class="record-meta"><span class="type ${esc(record.category.toLowerCase())}">${esc(record.category)}</span><time${record.date ? ` datetime="${esc(record.date)}"` : ''}>${esc(dateLabel(record))}</time><span class="record-id">${esc(record.id)}</span></div>
    <div class="record-body"><h3><button type="button" class="record-title" data-record="${esc(record.id)}">${esc(record.title)}</button></h3><p class="record-publisher">${esc(record.publisher)} <span aria-hidden="true">·</span> ${esc(record.retrieval)}</p><p class="record-summary">${esc(record.summary)}</p>${record.scopeBasis === 'source-text' ? '<p class="record-scope">Sand or gravel connection found in the source · Open for details</p>' : ''}<div class="record-tags">${record.countries.map(country => `<span class="tag location">${esc(country)}</span>`).join('')}${record.rivers.filter(river => river !== 'Mekong').map(river => `<span class="tag">${esc(river)}</span>`).join('')}${record.topics.slice(0,2).map(topic => `<span class="tag">${esc(topic)}</span>`).join('')}</div></div>
    <span class="record-open" aria-hidden="true">${icon('arrow-up-right')}</span>
  </article>`).join('');
  $('#empty').hidden = visible.length !== 0;
  $('#more').hidden = visible.length <= limit;
  $('#more').textContent = `Show more (${number(Math.max(0, visible.length-limit))} remaining)`;
  $('#empty-text').textContent = filters.country !== 'all' && !archive.records.some(r => r.countries.includes(filters.country)) ? `No ${filters.country} records have been added to this archive. This is a coverage gap, not evidence that extraction is absent.` : 'Try a broader search or reset the filters.';
  $('#export-csv').disabled = visible.length === 0;
}
function clearFilter(key) {
  if (key === 'search') { $('#search').value = ''; $('#hero-search').value = ''; }
  else $('#'+key).value = ['dateFrom','dateTo'].includes(key) ? '' : 'all';
}
function reset() {
  fields.forEach(clearFilter); clearFilter('search'); render();
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
  const scopeLabels = {headline:'The headline identifies sand or gravel extraction or a linked supply chain.', 'source-text':'A source passage discusses sand or gravel extraction or a linked supply chain.', 'previous-source-review':'A prior source review recorded a sand or gravel extraction or supply-chain connection.'};
  const scopeDetail = record.scopeBasis ? `<div class="detail-limit"><strong>Why this source is included</strong><p>${esc(scopeLabels[record.scopeBasis] || 'The record is being assessed for its connection to sand or gravel extraction.')}${record.scopeEvidence ? ` Source excerpt: “${esc(record.scopeEvidence)}”.` : ''} A connection does not establish what caused a particular event.</p></div>` : '';
  const mergedDetails = (record.mergedLocalRecords || []).map(source => `<details class="merged-source"><summary>Additional local source review${source.url !== record.url ? ' and source link' : ''}</summary><p>${esc(source.summary)}</p><p><strong>Limitations:</strong> ${esc(source.limitations)}</p>${source.dateConflictNote ? `<p><strong>Date reconciliation:</strong> ${esc(source.dateConflictNote)}</p>` : ''}${source.url !== record.url ? `<a href="${esc(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">Read the additional source ↗</a>` : ''}</details>`).join('');
  $('#record-detail').innerHTML = `<div class="detail-head"><span class="type ${esc(record.category.toLowerCase())}">${esc(record.category)}</span><span class="record-id">${esc(record.id)}</span><time${record.date ? ` datetime="${esc(record.date)}"` : ''}>${esc(dateLabel(record))}</time></div>
    <h2 class="detail-title" id="detail-title">${esc(record.title)}</h2><p class="detail-publisher">${esc(record.publisher)} · ${esc(record.authors)}</p>
    <p class="detail-summary">${esc(record.summary)}</p>
    ${scopeDetail}<div class="detail-limit"><strong>${icon('info')}How to interpret this source</strong><p>${esc(record.limitations)}</p></div>
    <dl class="detail-grid">${info.map(([label,value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
    <p class="detail-status">${esc(record.editorialStatus)}. ${record.titleTranslation ? esc(record.titleTranslation) + '. ' : ''}Inclusion does not independently verify the source’s claims.</p>${mergedDetails}
    <div class="detail-actions"><a class="button button-primary detail-source" href="${esc(safeUrl(record.url))}" target="_blank" rel="noopener noreferrer">Read the original source ${icon('arrow-up-right')}</a></div>`;
  $('#record-dialog').showModal(); $('#record-detail').scrollTop = 0; $('#close-dialog').focus();
}
function exportCsv() {
  const columns = ['id','title','originalTitle','publisher','authors','category','date','dateKind','studyPeriod','countries','rivers','location','topics','language','url','doi','summary','limitations','retrieval','retrievedAt','dateEvidence','editorialStatus','scopeBasis','scopeEvidence','additionalSourceUrls'];
  const rows = [columns, ...visible.map(record => columns.map(key => key === 'additionalSourceUrls' ? (record.mergedLocalRecords || []).map(source => source.url).join('; ') : Array.isArray(record[key]) ? record[key].join('; ') : record[key]))];
  const url = URL.createObjectURL(new Blob([csv(rows)], {type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a'); a.href = url; a.download = `${config.slug}-records.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#toast').textContent = `Exported ${number(visible.length)} records with source links and limitations`; $('#toast').hidden = false;
  setTimeout(() => $('#toast').hidden = true, 4000);
}
function bar(label, count, total) {
  return `<div class="country-bar"><span class="${count ? '' : 'zero'}">${esc(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${count / total * 100}%"></div></div><strong>${number(count)}</strong></div>`;
}
function renderCoverage() {
  const records = archive.records;
  $('#total-records').textContent = number(records.length);
  $('#total-research').textContent = number(records.filter(r => r.category === 'Research').length);
  $('#total-countries').textContent = new Set(records.flatMap(r => r.countries)).size;
  $('#total-sources').textContent = number(unique(records.map(r => r.url)).length);
  $('#pilot-date').textContent = `Archive updated ${dateLabel({date:archive.updated})} · ${archive.runs.some(r => r.kind === 'Automated daily collection') ? 'daily collection' : 'daily collection scheduled · first live run pending'}`;
  const counts = config.countries.map(country => ({country, count:records.filter(r => r.countries.includes(country)).length}));
  const categoryCounts = config.categories.map(category => ({category, count:records.filter(r => r.category === category).length}));
  $('#category-tabs').innerHTML = [{category:'all',label:'All sources',count:records.length}, ...categoryCounts.map(item => ({...item, label:categoryNames[item.category] || item.category}))].map(item => `<button type="button" class="category-tab" data-category="${esc(item.category)}" aria-pressed="${item.category === 'all'}"><strong>${number(item.count)}</strong><span>${esc(item.label)}</span></button>`).join('');
  renderInsights($('#insights'), records, pickInsight);
  $('#country-tabs').innerHTML = [{country:'all',count:records.length}, ...counts].map(item => `<button type="button" class="country-tab" data-country="${esc(item.country)}" aria-pressed="${item.country === 'all'}">${esc(item.country === 'all' ? 'All basin' : item.country)}<small>${number(item.count)}</small></button>`).join('');
  $('#country-bars').innerHTML = counts.map(({country,count}) => bar(country, count, records.length)).join('');
  $('#category-bars').innerHTML = categoryCounts.map(({category,count}) => bar(category, count, records.length)).join('');
  $('#source-rows').innerHTML = archive.sources.map(source => `<tr data-search="${esc(normalize([source.name, source.kind, source.status, source.note, source.languages.join(' ')].join(' ')))}"><td><a href="${esc(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.name)} ↗</a><br><span class="source-language">${esc(source.languages.join(' · '))}</span></td><td>${esc(source.kind)}</td><td><span class="source-status ${source.status === 'Planned' ? '' : 'read'}">${esc(source.status)}</span></td><td>${esc(source.note)}</td></tr>`).join('');
  $('#registry-count').textContent = `${number(archive.sources.length)} sources · ${number(archive.sources.filter(s => s.status !== 'Planned').length)} with a selected page read`;
  $('#runs').innerHTML = archive.runs.map(run => `<div class="run-entry"><time datetime="${esc(run.date)}">${esc(dateLabel({date:run.date}))}</time><div><strong>${esc(run.kind)} · ${number(run.added)} records</strong><p>${esc(run.note)}</p></div></div>`).join('');
  $('#scope-note').textContent = config.scopeNote;
  $('#repository-link').href = safeUrl(config.repositoryUrl);
}
function markNav() {
  const current = '#' + (view === 'insights' ? 'insights' : section);
  document.querySelectorAll('.masthead nav a').forEach(link => link.setAttribute('aria-current', link.getAttribute('href') === current ? 'page' : 'false'));
}
function setView(next) {
  view = next === 'insights' ? 'insights' : 'archive';
  const isInsights = view === 'insights';
  $('#home').hidden = isInsights;
  $('#archive').hidden = isInsights; $('#coverage').hidden = isInsights; $('#method').hidden = isInsights;
  $('#insights').hidden = !isInsights;
  if (isInsights) $('#to-search').hidden = true;
  markNav();
}
function showArchive() {
  setView('archive'); history.replaceState(null, '', '#archive');
  $('.browse-panel').scrollIntoView({behavior:'smooth', block:'start'});
}
function focusSearch() {
  showArchive(); $('#search').focus({preventScroll:true}); $('#search').select();
}
function runSearch(text) {
  $('#search').value = text; $('#hero-search').value = text; render(); showArchive(); $('#search').focus({preventScroll:true});
}
function pickInsight(filter, value) {
  reset(); $('#'+filter).value = value; render(); showArchive(); $('#archive-title').focus({preventScroll:true});
}
document.addEventListener('click', event => {
  const target = event.target;
  const nav = target.closest('.masthead [data-view]');
  if (nav) { setView(nav.dataset.view); }
  else if (target.closest('a[href="#home"], a[href="#archive"], a[href="#coverage"], a[href="#method"], a[href="#sources"]')) { setView('archive'); }
  const category = target.closest('[data-category]');
  if (category) { $('#category').value = category.dataset.category; render(); }
  const countryButton = target.closest('[data-country]');
  if (countryButton) { $('#country').value = countryButton.dataset.country; render(); }
  const quick = target.closest('[data-quick]');
  if (quick) runSearch(quick.dataset.quick);
  const clear = target.closest('[data-clear]');
  if (clear) { if (clear.dataset.clear === 'all') reset(); else { clearFilter(clear.dataset.clear); render(); } }
  // The whole card opens its record, unless the reader is selecting text.
  const card = target.closest('.record');
  if (card && (target.closest('.record-title') || !String(getSelection()).trim())) {
    const button = card.querySelector('.record-title');
    const record = archive?.records.find(r => r.id === button.dataset.record);
    if (record) detail(record, button);
  }
});
fields.forEach(key => $('#'+key).addEventListener('change', render));
$('#search').addEventListener('input', render); $('#sort').addEventListener('change', render);
$('#reset').addEventListener('click', reset); $('#empty-reset').addEventListener('click', reset);
$('#filters').addEventListener('submit', event => event.preventDefault());
$('#filter-toggle').addEventListener('click', () => {
  const open = $('#filters').hidden; $('#filters').hidden = !open; $('#filter-toggle').setAttribute('aria-expanded', String(open));
});
$('#hero-form').addEventListener('submit', event => {event.preventDefault(); runSearch($('#hero-search').value);});
$('#header-search').addEventListener('click', focusSearch);
$('#to-search').addEventListener('click', focusSearch);
$('#source-filter').addEventListener('input', event => {
  const terms = normalize(event.target.value).split(' ').filter(Boolean);
  let shown = 0;
  for (const row of $('#source-rows').rows) { const match = terms.every(term => row.dataset.search.includes(term)); row.hidden = !match; if (match) shown += 1; }
  $('#source-empty').hidden = shown > 0;
});
$('#close-dialog').addEventListener('click', () => $('#record-dialog').close());
$('#record-dialog').addEventListener('close', () => {if(lastRecordButton?.isConnected) lastRecordButton.focus({preventScroll:true});});
$('#record-dialog').addEventListener('click', event => {
  if (event.target !== $('#record-dialog')) return;
  const rect = event.target.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
});
$('#export-csv').addEventListener('click', exportCsv);
$('#more').addEventListener('click', () => {limit += 40; render(false);});
document.addEventListener('keydown', event => {if (event.key === '/' && !event.metaKey && !event.ctrlKey && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName) && !$('#record-dialog').open) {event.preventDefault(); focusSearch();}});
// Highlight the section being read, and offer a way back to the search once it scrolls away.
const spy = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) section = entry.target.id;
  markNav();
}, {rootMargin:'-45% 0px -50% 0px'});
['archive','coverage','method'].forEach(id => spy.observe($('#'+id)));
let pastTools = false, atFooter = false;
const searchReturn = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.target.tagName === 'FOOTER') atFooter = entry.isIntersecting;
    else pastTools = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
  }
  $('#to-search').hidden = !(view === 'archive' && pastTools && !atFooter);
});
searchReturn.observe($('.browse-panel')); searchReturn.observe($('footer'));
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
