import {countryShapes} from './country-shapes.js';
// Counts describe records in this archive, not mining activity or the number of events.
const el = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value != null) node.textContent = value;
  return node;
};
const counts = (records, keys) => {
  const result = new Map();
  for (const record of records) for (const key of new Set(keys(record).filter(Boolean))) result.set(key, (result.get(key) || 0) + 1);
  return result;
};
function chart(title, rows, filter, onPick, note) {
  const card = el('section', 'insight-card');
  card.append(el('h3', '', title));
  if (note) card.append(el('p', 'insight-note', note));
  const list = el('div', 'insight-bars');
  const maximum = Math.max(1, ...rows.map(([, n]) => n));
  for (const [name, count] of rows) {
    const button = el('button', 'insight-bar');
    button.type = 'button';
    button.setAttribute('aria-label', `${name}: ${count} records; open in archive`);
    const label = el('span', 'insight-bar-label', name);
    const track = el('span', 'insight-track');
    const fill = el('span', 'insight-fill');
    fill.style.width = `${count / maximum * 100}%`;
    track.append(fill);
    button.append(label, track, el('strong', '', String(count)));
    button.addEventListener('click', () => onPick(filter, name));
    list.append(button);
  }
  card.append(list);
  return card;
}
function countryMap(country, onPick) {
  const card = el('section', 'insight-card map-card');
  card.append(el('h3', '', 'Country overview'));
  card.append(el('p', 'insight-note', 'Country shading counts records mentioning each country, including regional records. This is not the basin boundary or a map of extraction sites.'));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 480 540'); svg.setAttribute('class', 'country-map');
  svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', 'Archive coverage by country; select a country to open the archive');
  const maximum = Math.max(1, ...country.values());
  for (const [name, d] of Object.entries(countryShapes)) {
    const n = country.get(name) || 0;
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', d); shape.setAttribute('fill-rule', 'evenodd');
    shape.setAttribute('fill', n ? `hsl(144 23% ${Math.round(88 - 48 * Math.sqrt(n / maximum))}%)` : '#eef1e8');
    shape.setAttribute('class', 'country-shape'); shape.setAttribute('tabindex', '0'); shape.setAttribute('role', 'button');
    shape.setAttribute('aria-label', `${name}: ${n} records; open in archive`);
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title'); title.textContent = `${name}: ${n} records`; shape.append(title);
    shape.addEventListener('click', () => onPick('country', name));
    shape.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); onPick('country', name);} });
    svg.append(shape);
  }
  card.append(svg);
  const note = el('p', 'insight-note'); note.append(document.createTextNode('Darker means more archived records. Country outlines: '));
  const link = el('a', '', 'Natural Earth'); link.href = 'https://www.naturalearthdata.com/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; note.append(link, document.createTextNode(' (public domain).'));
  card.append(note); return card;
}
export function renderInsights(root, records, onPick) {
  const country = counts(records, r => r.countries);
  const category = counts(records, r => [r.category]);
  const year = counts(records, r => [r.date ? r.date.slice(0,4) : 'undated']);
  const publisher = counts(records, r => [r.publisher]);
  const language = counts(records, r => [r.language]);
  const rank = map => [...map].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
  root.replaceChildren();
  const heading = el('div', 'insight-heading');
  heading.append(el('p', 'eyebrow', 'INSIGHTS'), el('h2', '', 'Where and what the archive covers.'), el('p', 'insight-intro', 'These are counts of archived sources, not extraction sites, extraction volumes, or separate events. Coverage reflects the sources and languages searched; a low count does not mean extraction is absent.'));
  root.append(heading);
  const tiles = el('div', 'insight-tiles');
  for (const [value, label] of [[records.length, 'archived sources'], [country.size, 'countries represented'], [publisher.size, 'publishers'], [language.size, 'source languages']]) {
    const tile = el('div', 'insight-tile'); tile.append(el('strong', '', String(value)), el('span', '', label)); tiles.append(tile);
  }
  root.append(tiles);
  const grid = el('div', 'insight-grid');
  grid.append(countryMap(country, onPick));
  grid.append(chart('Records by country', rank(country), 'country', onPick, 'A source may cover more than one country, so counts overlap.'));
  grid.append(chart('Records by source type', rank(category), 'category', onPick, 'Select a bar to browse that group.'));
  grid.append(chart('Records by source year', [...year].sort((a,b) => a[0] === 'undated' ? 1 : b[0] === 'undated' ? -1 : b[0].localeCompare(a[0])), 'year', onPick, 'Undated sources are listed separately. Years describe sources, not event dates.'));
  grid.append(chart('Most frequent publishers', rank(publisher).slice(0,10), 'publisher', onPick, 'Top ten publishers in the archive.'));
  grid.append(chart('Source languages', rank(language), 'language', onPick, 'English summaries of other languages may need native-language review.'));
  root.append(grid);
}
