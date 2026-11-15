// Adapted from Bangladesh Sand Watch's filtering, URL and CSV utilities.
// Geography is record metadata and configuration, rather than hard-coded district rules.
export function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/đ/g, 'd').replace(/\b(vietnam|viet nam)\b/g, 'viet nam')
    .replace(/\b(laos|lao pdr|lao people's democratic republic)\b/g, 'lao pdr')
    .replace(/\b(bassac|hau)\b/g, 'hau').replace(/\s+/g, ' ').trim();
}
export function safeUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; }
  catch { return ''; }
}
export function canonicalUrl(value) {
  const safe = safeUrl(value);
  if (!safe) return '';
  const u = new URL(safe); u.hash = '';
  for (const key of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(key)) u.searchParams.delete(key);
  return u.href.replace(/\/$/, '');
}
export function filterRecords(records, filters = {}) {
  const terms = normalize(filters.search).split(' ').filter(Boolean);
  return records.filter(r => {
    const corpus = normalize([r.id, r.title, r.publisher, r.summary, r.location,
      r.countries.join(' '), r.rivers.join(' '), r.topics.join(' '), r.doi,
      ...(r.mergedLocalRecords || []).flatMap(source => [source.title,source.url,source.summary,source.doi])].join(' '));
    return terms.every(term => corpus.includes(term)) &&
      ['category', 'publisher', 'language'].every(key => !filters[key] || filters[key] === 'all' || r[key] === filters[key]) &&
      (!filters.country || filters.country === 'all' || r.countries.includes(filters.country)) &&
      (!filters.river || filters.river === 'all' || r.rivers.includes(filters.river)) &&
      (!filters.topic || filters.topic === 'all' || r.topics.includes(filters.topic)) &&
      (!filters.year || filters.year === 'all' || (filters.year === 'undated' ? !r.date : r.date?.startsWith(filters.year))) &&
      (!filters.dateFrom || (r.date && r.date >= filters.dateFrom)) &&
      (!filters.dateTo || (r.date && r.date <= filters.dateTo));
  });
}
export function sortRecords(records, sort = 'newest') {
  return [...records].sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'publisher') return a.publisher.localeCompare(b.publisher) || a.id.localeCompare(b.id);
    if (!a.date && !b.date) return a.id.localeCompare(b.id);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return (sort === 'oldest' ? 1 : -1) * a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
  });
}
export function csv(rows) {
  const cell = value => {
    let s = String(value ?? '');
    if (/^[\s]*[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
export function dateLabel(record) {
  return record.date ? new Intl.DateTimeFormat('en', {year:'numeric', month:'short', day:'numeric', timeZone:'UTC'})
    .format(new Date(record.date + 'T12:00:00Z')) : 'Publication date unverified';
}
