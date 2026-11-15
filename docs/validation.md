# Validation and deployment status

Implementation date: 14 November 2026 (America/Chicago).

The owner explicitly approved creating the public repository and publishing the separate GitHub Pages pilot in this chat. The new public repository has been created at https://github.com/sadiulchyon/mekong-sand-watch. Publication is in progress; the intended Pages address is https://sadiulchyon.github.io/mekong-sand-watch/.

Checks passed: record schema and source evidence, country and river filters, aliases and diacritics, date ranges and unverified dates, URL/DOI uniqueness, CSV formula escaping, JavaScript syntax, DOM targets, static assets and deployment isolation. The static build succeeded.

Chrome verified country selection (Cambodia: one record), zero-coverage messaging (China), source-detail content and original link, modal dismissal, combined country/river/research filters (two records), and Vietnamese diacritic search. The CSV download was read back from disk: it contained exactly MSW-001 and MSW-002, with source links and limitations. The browser download-event wait timed out, but the actual downloaded CSV confirms the export succeeded.

Desktop layout was visually inspected. Mobile layout and final deployed readback remain to be completed. The original Bangladesh folder has a saved before-work hash baseline for final comparison.
