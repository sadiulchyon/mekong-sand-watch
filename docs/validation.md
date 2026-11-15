# Validation and deployment status

The 15 November 2026 archive contains 236 records after removing one gold-mining news item and adding 12 source-checked research articles from the supplied Edison bibliography. Papers already present were not duplicated. Contextual studies and abstract-only reviews are identified in their records. One study of the Dong Nai / Soai Rap estuary was excluded because its study area is outside the Mekong basin. The 96 non-English source headlines were translated into English; the original titles are retained in record details and require native-language review. The local archive merge retained all 20 local entries: 18 new records and two duplicate source reviews kept within existing records, including original local IDs and source links. A publisher date conflict was resolved against Thai PBS while retaining the local date for provenance. The first production collection failed before publishing; the next two completed successfully. The latest TinyFish-first run performed 13 searches, reviewed 60 candidates and added three records; two are based on a radio-programme introduction or video description, which is explicitly labeled. Firecrawl was not used in that run. Category selection, source-linked map and insights filters were checked in the browser. English summaries of Thai, Khmer, Chinese and Vietnamese sources require native-language review. Counts describe archived sources, not extraction sites or independent events. See README for the daily schedule and setup.

## Original pilot validation (historical)


Implementation date: 14 November 2026 (America/Chicago).

Published site: https://sadiulchyon.github.io/mekong-sand-watch/

Independent public repository: https://github.com/sadiulchyon/mekong-sand-watch

The owner explicitly approved public repository and site publication in this chat. The GitHub Pages deployment succeeded: https://github.com/sadiulchyon/mekong-sand-watch/actions/runs/43663173097 (second attempt). The first attempt ran before Pages was enabled and failed at Pages configuration; it passed after selecting GitHub Actions as the source and rerunning. The deployed archive returned HTTP 200, contained MSW-001 through MSW-004, and matched the local archive byte for byte. Chrome confirmed all four records on the live site.

## Checks completed

- Record schema, date evidence, country/river vocabularies, URL/DOI uniqueness and required source limitations.
- Country/river/category combinations, country aliases and Vietnamese diacritics, date ranges, undated filtering and sorting, and empty results.
- CSV formula escaping, JavaScript syntax, DOM targets, static assets and deployment isolation; static build passed locally and in GitHub Actions.
- Chrome: Cambodia filter returned one record; China displayed the coverage-gap message; combined Viet Nam/Tien/Research filters returned two records; Vietnamese diacritic search returned the same results; the cross-border topic returned one record; unverified-date filter returned the two project pages.
- Source dialog content, original source link and dismissal; no browser console errors observed in the tested local flows.
- Actual browser CSV download read back from disk: exactly MSW-001 and MSW-002, with source URLs and limitations. The browser download-event wait timed out, but the downloaded file verified success.
- Desktop layout and mobile layout at 390 × 844 visually inspected. Mobile document width was 390 pixels, with no page-wide horizontal overflow. The temporary viewport override was reset.
- Original Bangladesh source folder: all 5,396 files matched the before-work SHA-256 baseline; no additions, deletions or content changes, and Git status unchanged. No write operations targeted the original GitHub repository.

The new local checkout is /Users/Saadi/Desktop/mekong-sand-watch/. Its origin points only to the new repository. Terminal Git authentication was unavailable, so publication used the connected GitHub tool. The local history was aligned with the remote only after confirming the tracked file trees were identical.

## Pilot limits

Four selected source records, weighted toward Viet Nam; English interface and summaries; owner editorial review pending. No current-year news coverage, official instrument review, China/Myanmar pilot records, or recurring collector is claimed. The schematic is not georeferenced. Country record counts overlap, project pages overlap, and record counts are not extraction totals.
