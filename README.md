# Mekong Sand Watch

An independent pilot evidence archive on sand extraction, sediment and governance in the Mekong basin. It was developed from the archive concepts and static deployment pattern in [Bangladesh Sand Watch](https://github.com/sadiulchyon/bangladesh-sand-watch). The original project remains separate.

## Run locally

Node 22 or newer is sufficient. There are no runtime packages to install.

```sh
npm run check
npm run dev
```

Open the printed local URL. `npm run build` writes a deployable static site to `_site/`. On this Mac, if Node is not on PATH, the bundled executable is `/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node`; it can run each `scripts/*.mjs` file directly.

## What works

- Search titles, summaries, named places, rivers, countries, publishers and DOI; Vietnamese diacritics and common country aliases are normalized.
- Combine country, river, category, topic, publisher, source year, language and publication-date filters. Unverified dates remain separate and sort last.
- Read source details, observation periods, date evidence, limitations, and original links in an accessible dialog.
- Export the filtered records to UTF-8 CSV, including source links and limitations, with spreadsheet formula escaping.
- Inspect country representation, source-type totals, the source registry, and the collection history.
- Deploy an independent read-only site to GitHub Pages using `.github/workflows/pages.yml`.

## Data and scope

`public/config.json` holds the region, identity, country list, river vocabulary, URLs and categories. `public/data/archive.json` holds records, source registry and collection history. The initial four records represent two research papers, a sand-budget project page, and a related institutional project account. Every original page was retrieved and read on 14 November 2026 (America/Chicago). These are AI-prepared pilot summaries awaiting owner editorial review; their presence is not independent verification. The two project pages overlap and do not represent separate extraction events.

The intended basin scope includes China, Myanmar, Lao PDR, Thailand, Cambodia and Viet Nam. Current records represent the four Lower Mekong countries and are weighted toward Viet Nam. China and Myanmar have no pilot records. English is the initial interface and summary language. Local-language discovery and review remain future work. The river illustration is a schematic, without geographic boundaries or mining sites.

No publication date was verified for the two project pages. Their date is `null`; project periods and retrieval dates are not substituted. The 2013 survey has mixed country observation years. The Deltares page contains conflicting percentage claims, which are excluded from the summary and recorded as a limitation. See [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md).

## Adding evidence

Edit `public/data/archive.json`, preserve the record schema and source trail, and run the checks before committing. Keep original titles and dates, country arrays, named rivers, units, observation periods, attribution, and uncertainty. Record an original-page read before drafting a summary. Deduplicate canonical URLs and DOI. Different records can describe the same project; do not treat record counts as event counts or add extraction estimates across incompatible studies.

No recurring collection, paid API calls, or credentials are configured in this repository. The existing Bangladesh collector was inspected but not copied: its publisher list, prompts, language checks, geography and publication authority are specific to that project.

## Deploy

The intended repository is `sadiulchyon/mekong-sand-watch`, with a distinct Pages URL `https://sadiulchyon.github.io/mekong-sand-watch/`. The owner approved public repository and site publication on 14 November 2026. See docs/validation.md for verified deployment status. Select **GitHub Actions** under this repository's Settings → Pages, then push `main` or run **Deploy Mekong Sand Watch**. Do not change Pages or Actions in the Bangladesh repository.

The workflow checks data and browser code, copies `public/` to `_site/`, uploads the Pages artifact and deploys it. All browser asset paths are relative, so GitHub's repository subpath works. Public visitors have no editorial or ingestion API to write to.

## Codebase notes and expansion

See [docs/architecture.md](docs/architecture.md) for the original-codebase assessment, what was retained, and the next implementation stages toward a broader regional archive. Deployment status and browser QA are recorded in [docs/validation.md](docs/validation.md).
