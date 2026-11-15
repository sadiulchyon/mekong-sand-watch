// Rotate additional basin coverage without multiplying the number of API searches.
const focusedSearches = [
  'Srepok Sesan Sekong river sand mining extraction',
  'Mekong Myanmar sand mining river dredging',
  'Laos Mekong tributary river sand gravel mining',
  'Lancang Yunnan river sand mining dredging',
  'Mekong river sand mining peer reviewed research'
];
export function focusedSearch(dayIndex) {
  return focusedSearches[((dayIndex % focusedSearches.length) + focusedSearches.length) % focusedSearches.length];
}
// Draw one result from each query before considering the next result from any query.
export function interleave(groups) {
  const result = [];
  const maximum = Math.max(0, ...groups.map(group => group.length));
  for (let index = 0; index < maximum; index++) {
    for (const group of groups) if (index < group.length) result.push(group[index]);
  }
  return result;
}
// Additional source reviews were merged without losing their original links.
export function archiveSourceUrls(records, canonicalUrl) {
  return new Set(records.flatMap(record => [record.url, ...(record.mergedLocalRecords || []).map(source => source.url)]).map(canonicalUrl).filter(Boolean));
}
