# Codebase assessment and Mekong implementation

Assessed on 14 November 2026 from the local `/Users/Saadi/Desktop/sand-watch/` checkout and the open public GitHub Pages site. The local checkout is older than the live site's current archive. No existing source files, original repository settings or original deployment were edited.

## Original Bangladesh architecture

The active public deployment is GitHub Pages. `scripts/build-pages.mjs` copies `public/` to `_site/` and generates `data/archive.json`. `scripts/archive-data.mjs` loads a D1 SQL snapshot through Node SQLite, applies Drizzle migrations and merges the JSON snapshots by ID. Public export strips editorial notes. `public/app.js` fetches that archive in public mode; the same interface has older database-backed review behavior for private hosting.

`public/core.js` supplies category grouping, filters, sorting, CSV escaping and related-record hints. `public/places.js` and much of `app.js` contain Bangladesh-specific districts, rivers, transliteration rules, bilingual interface strings and record assumptions. `visuals.js` and `insights.js` add the field-photo gallery and archive charts. The field media is from Bangladesh, so it is not suitable as Mekong imagery.

`collector/collect.mjs` performs bounded discovery, original-page retrieval, Claude drafting, evidence checks and a second editorial pass. It uses Bangladesh publishers, Bangla/English prompts, IDs and relevance rules. `.github/workflows/collect.yml` schedules that collector. `.github/workflows/pages.yml` checks, builds and deploys the public site.

The root Vinext/Next/Drizzle code, `app/`, `server/`, Cloudflare Worker, SQL exports and `.openai/hosting.json` support earlier private hosting and migration work. They are not necessary for the public static archive and must not be reused with production identities or database bindings in a new region.

## New Mekong structure

| Path | Responsibility |
| --- | --- |
| `public/config.json` | Independent identity, basin vocabulary, categories, scope and URLs |
| `public/data/archive.json` | New Mekong records, registry, date evidence, limitations and run history |
| `public/core.js` | Region-neutral filtering, URL handling, sorting, date labels and safe CSV |
| `public/app.js` | Archive, filters, source dialog, export and derived coverage counts |
| `public/styles.css` | Responsive Mekong visual design, adapted archive patterns |
| `public/assets/` | Original SVG identity and clearly labeled basin schematic |
| `scripts/check.mjs` | Evidence schema, uniqueness, core behavior, syntax and asset checks |
| `scripts/build-pages.mjs` | Isolated static build |
| `scripts/serve.mjs` | Dependency-free local preview on loopback |
| `.github/workflows/pages.yml` | Separate Pages deployment; no collection cron |

This is a focused adaptation, not a full clone of the old deployment. It retains the useful searchable-archive, provenance, export and static-hosting design while removing the old runtime requirements. Browser assets and requests use relative paths for repository-subpath hosting. New record IDs use `MSW-`. There is no shared database, storage namespace, hosted Site identity or credential.

## Next implementation stages

1. Owner review of the four pilot summaries, the six-country basin boundary and English-first interface.
2. Add dated reporting and primary official material across the Lower Mekong, with original-language metadata and reviewer capability. Broaden China/Myanmar coverage where it directly concerns the basin. Check candidate sources before claiming coverage.
3. Add a reviewed import/collection pipeline. Keep pending records outside the public build until publication rules are agreed. Retain retrieval evidence and failure logs; validate country/river tags and source-date evidence. Preserve budget limits and avoid transferring Bangladesh-specific permissions.
4. Introduce original-language titles and reviewed translations. Add language-specific aliases and river/location authority tables as evidence grows.
5. Consider Asia or South Asia as separate configurations only after defining comparable geographic boundaries, source strategies and governance categories. The current configuration split supports this without replacing the Mekong deployment.

A separate daily Mekong collector was added on 14 November 2026. See README for credential requirements, model and retrieval budgets, audit records, and the daily schedule.
