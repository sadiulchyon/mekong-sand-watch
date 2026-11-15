# Validation and deployment status

The 15 November 2026 expansion contains 145 records. Source pages were read for the additions; several research entries rely on accessible abstracts or highlights and Thai-, Chinese- and Vietnamese-language summaries await native-language review. A live-credential dry run completed on 14 November: all 13 searches succeeded and the first eight candidates yielded no additions after filtering and review. The first production run on 15 November failed after individual source retrieval or processing failures, before publishing any changes. The failure handling was corrected and tested with five inaccessible sources followed by a successful source; a separate all-sources-inaccessible test still fails visibly. A corrected production run remains to be verified. The collector records source-quoted named rivers for future filtering and rotates earlier source-year searches. See README for the schedule and setup.

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
