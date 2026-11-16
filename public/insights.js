import {countryShapes} from './country-shapes.js';
import {riverShapes} from './river-shapes.js?v=20261115-basin1';
import {basinShape} from './basin-shape.js';
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
  const header = el('div', 'map-heading');
  header.append(el('div', '', ''), el('span', 'map-kicker', 'MEKONG REGION'));
  header.firstChild.append(el('h3', '', 'Country overview'), el('p', 'insight-note', 'Explore where the archive’s sources are concentrated. Select a country to see its records.'));
  card.append(header);
  const layout = el('div', 'map-layout');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const ns = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}, text) => {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text != null) node.textContent = text;
    return node;
  };
  svg.setAttribute('viewBox', '0 0 480 540'); svg.setAttribute('class', 'country-map');
  svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', 'Archive coverage by country with an approximate Mekong basin outline, the Lancang and Mekong, Chi, Mun, Tonlé Sap and Srepok rivers, and the Mekong Delta. Select a country to open its records.');
  const grid = svgEl('g', {class: 'map-graticule', 'aria-hidden': 'true'});
  for (const x of [100, 200, 300, 400]) grid.append(svgEl('path', {d: `M${x},0 V540`}));
  for (const y of [100, 200, 300, 400, 500]) grid.append(svgEl('path', {d: `M0,${y} H480`}));
  svg.append(grid);
  const maximum = Math.max(1, ...country.values());
  for (const [name, d] of Object.entries(countryShapes)) {
    const n = country.get(name) || 0;
    const shape = svgEl('path', {d, 'fill-rule': 'evenodd', fill: n ? `hsl(36 45% ${Math.round(90 - 42 * Math.sqrt(n / maximum))}%)` : '#f8f4ec', class: 'country-shape', tabindex: '0', role: 'button', 'aria-label': `${name}: ${n} records; open in archive`});
    shape.append(svgEl('title', {}, `${name}: ${n} records`));
    shape.addEventListener('click', () => onPick('country', name));
    shape.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); onPick('country', name);} });
    svg.append(shape);
  }
  svg.append(svgEl('path', {d: basinShape, class: 'map-basin-boundary', 'aria-hidden': 'true'}));
  const rivers = svgEl('g', {class: 'map-rivers', 'aria-hidden': 'true'});
  rivers.append(svgEl('path', {d: riverShapes.tributary, class: 'map-river-tributary'}), svgEl('path', {d: riverShapes.main, class: 'map-river-main'}));
  svg.append(rivers);
  // Placed in projected map coordinates; Viet Nam uses a short leader for legibility.
  const labels = [
    ['China', 212, 139], ['Myanmar', 104, 282], ['Thailand', 180, 391],
    ['Lao PDR', 260, 319], ['Cambodia', 291, 451], ['Viet Nam', 405, 400]
  ];
  const labelLayer = svgEl('g', {class: 'country-labels', 'aria-hidden': 'true'});
  labelLayer.append(svgEl('path', {d: 'M376,402 L356,403', class: 'map-leader'}));
  for (const [name, x, y] of labels) {
    const group = svgEl('g', {class: 'country-map-label'});
    const width = Math.max(54, name.length * 6.8 + 18);
    group.append(svgEl('rect', {x: x - width / 2, y: y - 12, width, height: 24, rx: 12}), svgEl('text', {x, y: y + 4, 'text-anchor': 'middle'}, name));
    group.addEventListener('click', () => onPick('country', name));
    labelLayer.append(group);
  }
  svg.append(labelLayer);
  const geographicLabels = svgEl('g', {class: 'map-geography', 'aria-hidden': 'true'});
  // Leaders point to the named Natural Earth river lines; the delta is an area label.
  const waterLabels = [
    ['Lancang', 105, 208, 'M158,204 L198,200'],
    ['Mekong', 382, 354, 'M370,359 L303,362'],
    ['Chi', 205, 362, 'M220,362 L257,376'],
    ['Mun', 209, 420, 'M230,415 L265,397'],
    ['Tonlé Sap', 182, 467, 'M240,464 L286,450'],
    ['Srepok', 398, 461, 'M387,454 L337,432'],
    ['Mekong Delta', 388, 514, 'M378,506 L322,495']
  ];
  for (const [name, x, y, leader] of waterLabels) {
    geographicLabels.append(svgEl('path', {d: leader}), svgEl('text', {x, y}, name));
  }
  svg.append(geographicLabels);
  const north = svgEl('g', {class: 'map-north', 'aria-label': 'North is up'});
  north.append(svgEl('circle', {cx: 449, cy: 37, r: 22}), svgEl('text', {x: 449, y: 31, 'text-anchor': 'middle'}, 'N'), svgEl('path', {d: 'M449,35 L443,48 L449,45 L455,48 Z'}));
  svg.append(north);
  // In this equirectangular view, 500 km spans about 93 SVG units at 15°N.
  const scale = svgEl('g', {class: 'map-scale', 'aria-label': 'Approximate scale at 15 degrees north: 500 kilometres'});
  scale.append(svgEl('rect', {x: 14, y: 484, width: 147, height: 44, rx: 8}), svgEl('path', {d: 'M25,508 V513 M25,511 H118 M118,508 V513'}), svgEl('text', {x: 25, y: 504}, '0'), svgEl('text', {x: 118, y: 504, 'text-anchor': 'end'}, '500 km'), svgEl('text', {x: 25, y: 523, class: 'map-scale-note'}, 'approx. at 15°N'));
  svg.append(scale);
  layout.append(svg);
  const side = el('div', 'map-side');
  side.append(el('p', 'map-side-label', 'ARCHIVED SOURCES'), el('h4', '', 'A regional view'), el('p', 'map-explanation', 'Darker shading means more records mention that country. A record can include more than one country.'));
  const legend = el('div', 'map-legend');
  legend.append(el('div', 'map-gradient'), el('div', 'map-legend-labels'));
  legend.lastChild.append(el('span', '', 'Fewer records'), el('span', '', 'More records'));
  side.append(legend);
  const list = el('div', 'map-country-list');
  for (const [name] of labels) {
    const button = el('button', 'map-country-button');
    button.type = 'button'; button.setAttribute('aria-label', `${name}: ${country.get(name) || 0} records; open in archive`);
    button.append(el('span', '', name), el('strong', '', String(country.get(name) || 0)));
    button.addEventListener('click', () => onPick('country', name)); list.append(button);
  }
  side.append(list, el('p', 'map-boundary-key', 'Mekong basin boundary · approximate'), el('p', 'map-river-key', 'Lancang / Mekong, Chi, Mun, Tonlé Sap and Srepok'));
  layout.append(side); card.append(layout);
  const note = el('p', 'map-footnote');
  note.append(document.createTextNode('Country shading counts sources, not extraction sites. The generalized basin outline is approximate, especially near the delta; scale varies with latitude. Country boundaries and rivers: '));
  const link = el('a', '', 'Natural Earth'); link.href = 'https://www.naturalearthdata.com/'; link.target = '_blank'; link.rel = 'noopener noreferrer';
  const basinLink = el('a', '', 'World Bank Major River Basins of the World'); basinLink.href = 'https://datacatalog.worldbank.org/search/dataset/0041426/major-river-basins-of-the-world'; basinLink.target = '_blank'; basinLink.rel = 'noopener noreferrer';
  const license = el('a', '', 'CC BY 4.0'); license.href = 'https://creativecommons.org/licenses/by/4.0/'; license.target = '_blank'; license.rel = 'noopener noreferrer';
  note.append(link, document.createTextNode(' (public domain). Basin outline: '), basinLink, document.createTextNode(' ('), license, document.createTextNode('; Mekong polygon selected and simplified).')); card.append(note);
  return card;
}
function researchSpotlight() {
  const section = el('section', 'research-spotlight');
  section.setAttribute('aria-labelledby', 'research-spotlight-title');
  const header = el('div', 'spotlight-heading');
  const copy = el('div', 'spotlight-copy');
  const title = el('h3', '', 'What happens when rivers lose their sand?'); title.id = 'research-spotlight-title';
  copy.append(el('p', 'eyebrow', 'RESEARCH SPOTLIGHT · GLOBAL REVIEW'), title,
    el('p', 'spotlight-description', 'A 2026 review by Edward Park, Christopher Hackney and colleagues brings together 411 studies to connect extraction, river change and management. Its global synthesis includes examples from the Mekong.'));
  const paper = el('a', 'button spotlight-paper', 'Read the open-access paper ↗');
  paper.href = 'https://doi.org/10.1029/2024RG000868'; paper.target = '_blank'; paper.rel = 'noopener noreferrer';
  header.append(copy, paper); section.append(header);
  const figures = el('div', 'spotlight-figures');
  const items = [
    {src:'assets/park-hackney-2026-figure4.jpg', label:'RIVER PROCESSES · FIGURE 4', title:'From headwaters to delta', description:'A conceptual view of how gravel and sand extraction can change channels, sediment supply and banks.', alt:'Conceptual figure showing gravel and sand mining zones from headwaters to delta, downstream channel trends, and pathways linking extraction with riverbed and bank change.', credit:'Figure 4 visualized by N.T.N. Phuong (Earth Observatory of Singapore, NTU).'},
    {src:'assets/park-hackney-2026-figure14.jpg', label:'MANAGEMENT · FIGURE 14', title:'Connecting science and decisions', description:'The authors’ proposed adaptive cycle links monitoring, governance and community participation.', alt:'Conceptual adaptive management cycle linking science and monitoring, governance and regulation, and stakeholder engagement.', credit:'Figure 14 from the published review.'}
  ];
  for (const item of items) {
    const figure = el('figure', 'spotlight-figure');
    const link = el('a', 'spotlight-image'); link.href = item.src; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', `Open full-size figure: ${item.title}`);
    const img = document.createElement('img'); img.src = item.src; img.alt = item.alt; img.loading = 'lazy'; link.append(img);
    const caption = el('figcaption', 'spotlight-caption');
    caption.append(el('p', 'spotlight-label', item.label), el('h4', '', item.title), el('p', '', item.description), el('p', 'figure-credit', item.credit + ' Park et al. (2026), CC BY 4.0; reproduced without changes.'));
    figure.append(link, caption); figures.append(figure);
  }
  section.append(figures);
  const cite = el('p', 'spotlight-citation');
  cite.append(document.createTextNode('Park, Hackney, Tran and colleagues (2026), '));
  const paperLink = el('a', '', 'Reviews of Geophysics'); paperLink.href = 'https://doi.org/10.1029/2024RG000868'; paperLink.target = '_blank'; paperLink.rel = 'noopener noreferrer';
  const license = el('a', '', 'CC BY 4.0'); license.href = 'https://creativecommons.org/licenses/by/4.0/'; license.target = '_blank'; license.rel = 'noopener noreferrer';
  cite.append(paperLink, document.createTextNode(' · '), license, document.createTextNode(' · Select a figure to view it at full size.')); section.append(cite);
  return section;
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
  root.append(tiles, researchSpotlight());
  const grid = el('div', 'insight-grid');
  grid.append(countryMap(country, onPick));
  grid.append(chart('Records by country', rank(country), 'country', onPick, 'A source may cover more than one country, so counts overlap.'));
  grid.append(chart('Records by source type', rank(category), 'category', onPick, 'Select a bar to browse that group.'));
  grid.append(chart('Records by source year', [...year].sort((a,b) => a[0] === 'undated' ? 1 : b[0] === 'undated' ? -1 : b[0].localeCompare(a[0])), 'year', onPick, 'Undated sources are listed separately. Years describe sources, not event dates.'));
  grid.append(chart('Most frequent publishers', rank(publisher).slice(0,10), 'publisher', onPick, 'Top ten publishers in the archive.'));
  grid.append(chart('Source languages', rank(language), 'language', onPick, 'English summaries of other languages may need native-language review.'));
  root.append(grid);
}
