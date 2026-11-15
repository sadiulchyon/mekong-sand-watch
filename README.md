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
- Choose source categories directly and explore clickable charts by country, source type, year, publisher, and language in Insights. These charts count sources, not mining events. The country overview uses Natural Earth 1:110m country boundaries (v5.1.2, public domain), clipped to a regional viewport; it is not a basin boundary or site map.
- Read English headlines, original-language headlines where translated, observation periods, date evidence, limitations, merged source reviews, and original links in an accessible dialog. Headlines and summaries translated from regional languages await native-language review. Gold-mining news is excluded from the archive.
- Export the filtered records to UTF-8 CSV, including source links and limitations, with spreadsheet formula escaping.
- Inspect country representation, source-type totals, the source registry, and the collection history.
- Deploy an independent read-only site to GitHub Pages using `.github/workflows/pages.yml`.

## Data and scope

`public/config.json` holds the region, identity, country list, river vocabulary, URLs and categories. `public/data/archive.json` holds records, source registry and collection history. The initial collection includes research, journalism and project accounts. Some papers are represented by publisher abstracts, explicitly labeled in their records. Summaries await owner review and inclusion is not independent verification. The two original project pages overlap and do not represent separate extraction events.

The intended basin scope includes China, Myanmar, Lao PDR, Thailand, Cambodia and Viet Nam. The current collection is weighted toward Viet Nam; China has one upper-basin press record and Myanmar appears only in regional context. English is the initial interface and summary language. Local-language discovery is underway; native-language editorial review remains necessary. The river illustration is a schematic, without geographic boundaries or mining sites.

No publication date was verified for the two project pages. Their date is `null`; project periods and retrieval dates are not substituted. The 2013 survey has mixed country observation years. The Deltares page contains conflicting percentage claims, which are excluded from the summary and recorded as a limitation. See [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md).

## Adding evidence

Edit `public/data/archive.json`, preserve the record schema and source trail, and run the checks before committing. Keep original titles and dates, country arrays, named rivers, units, observation periods, attribution, and uncertainty. Record an original-page read before drafting a summary. Deduplicate canonical URLs and DOI. Different records can describe the same project; do not treat record counts as event counts or add extraction estimates across incompatible studies.

## Daily collection

`.github/workflows/collect.yml` runs at 15:40 UTC daily (09:40 Chicago in winter, 10:40 in summer), and can also be run manually with `dry_run` and `max_records` (maximum 20). The collector searches in English, Vietnamese, Khmer, Lao and Thai, rotates an additional basin focus and interleaves results from different queries; reads original pages using TinyFish, direct retrieval, then Firecrawl as a bounded fallback; asks Claude for a source-based English record and English headline while retaining the original title; screens out gold-mining news; checks date and figure quotations; and runs an independent second model review. It stores source hashes, date evidence, figure quotes, outcomes and model usage in `collection-runs/`. English translations and summaries require native-language review; editorial acceptance is not independent verification. Source coverage is incomplete, and a zero-addition run does not establish no relevant reporting exists.

Required repository-specific GitHub Actions secrets: `TINYFISH_API_KEY` and `ANTHROPIC_API_KEY`. Optional `FIRECRAWL_API_KEY` is capped at 10 scrapes per run and preserves a balance of at least 5 credits; when its balance cannot be verified, fallback is disabled. The collector fails closed if required keys are missing. These secrets are not shared with the Bangladesh repository. Claude API usage is capped at 65 model calls per run; provider and model charges depend on account pricing. Collection requires these secrets to be configured in the Mekong repository.

The workflow checks the archive and static build, commits the new data and source-review log, explicitly dispatches its own Pages workflow, and verifies all new record IDs in the public archive. Dry runs do not save or publish. The Mekong publisher list, prompts, geographic scope and credentials are independent of Bangladesh Sand Watch.

## Deploy

The intended repository is `sadiulchyon/mekong-sand-watch`, with a distinct Pages URL `https://sadiulchyon.github.io/mekong-sand-watch/`. The owner approved public repository and site publication on 14 November 2026. See docs/validation.md for verified deployment status. Select **GitHub Actions** under this repository's Settings → Pages, then push `main` or run **Deploy Mekong Sand Watch**. Do not change Pages or Actions in the Bangladesh repository.

The workflow checks data and browser code, copies `public/` to `_site/`, uploads the Pages artifact and deploys it. All browser asset paths are relative, so GitHub's repository subpath works. Public visitors have no editorial or ingestion API to write to.

## Codebase notes and expansion

See [docs/architecture.md](docs/architecture.md) for the original-codebase assessment, what was retained, and the next implementation stages toward a broader regional archive. Deployment status and browser QA are recorded in [docs/validation.md](docs/validation.md).
