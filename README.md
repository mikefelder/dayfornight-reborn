# Day for Night - Reborn

Rebuilt site for Day for Night festival

## Routes

| Path | Content | Source Snapshot |
|------|---------|----------------|
| `/` | Random rotation across all snapshots (session-based cooldown) | — |
| `/2015/` | 2015 Flora lineup site | `20151205012054` |
| `/2015/splash/` | Original splash/holding page (static HTML) | — |
| `/2015/recap/` | Post-festival recap (static Wayback snapshot) | `20160315150212` |
| `/2015/artists/:slug` | Individual 2015 artist pages | `20151205012054` |
| `/2015/info` | Festival info | `20151205012054` |
| `/2015/schedule` | Schedule | `20151205012054` |
| `/2016/` | Blind-presale page (video hero, YouTube lightbox) | `20160724233124` |
| `/2016/lineup/` | Full lineup with time-of-day gradient system | `20161004003918` |
| `/2016/lineup/sound/` | Sound lineup category | `20161004003918` |
| `/2016/lineup/light/` | Light lineup category | `20161004003918` |
| `/2016/lineup/sound/:slug` | 2016 sound artist detail pages | `20161004003918` |
| `/2016/lineup/light/:slug` | 2016 light artist detail pages | `20161004003918` |
| `/2016/about/` | About page | `20161004003918` |
| `/2016/faq/` | FAQ | `20161004003918` |
| `/2016/schedule/` | Schedule | `20161004003918` |
| `/2016/recap/` | Post-festival recap (VICE quote, Vimeo video, sponsors) | `20170116070040` |
| `/2017/` | 2017 homepage with featured artist listings | `20171222234154` |
| `/2017/lineup/` | Full 93-artist lineup with tab filtering (sound/light/talks) | `20171222234154` |
| `/2017/about/` | About page with artist directory | `20171222234154` |
| `/2017/faq/` | FAQ | `20171222234154` |
| `/2017/schedule/` | 3-day schedule grid | `20171222234154` |
| `/2017/media/` | Video playlist (12 Vimeo) + photo gallery (25 images) | `20171222234154` |
| `/2017/sponsors/` | Sponsors | `20171222234154` |
| `/2017/sound/:slug` | 2017 sound artist pages (63 artists) | `20171222234154` + Wayback |
| `/2017/light/:slug` | 2017 light artist pages (19 artists) | `20171222234154` + Wayback |
| `/2017/talks/:slug` | 2017 talks artist pages (10 artists) | `20171222234154` + Wayback |

**Build output:** 259 pages, ~3s build time.

## Structure

```
src/            → Astro source (pages, layouts, components, content)
public/         → Static assets copied to build output as-is
  shared-assets/2015/  → Images, CSS, fonts for the 2015 archive
  shared-assets/2016/  → Images, CSS, fonts, videos for the 2016 archive
  shared-assets/2017/  → Images, CSS, fonts, videos for the 2017 archive
  2015/splash/         → Original splash page (self-contained HTML)
  2015/recap/          → 20160315150212 Wayback snapshot
infra/          → Terraform for Azure infrastructure
.github/        → CI/CD workflows
scripts/        → Content extraction scripts
```

## Development

```bash
npm install
npm run dev       # Local dev server
npm run build     # Static build → dist/
npm run preview   # Preview built site
```

## Setup

### Prerequisites

- Azure subscription
- Terraform >= 1.5
- GitHub repo with these secrets configured:
  - `AZURE_CLIENT_ID` — Service principal / federated identity client ID
  - `AZURE_SUBSCRIPTION_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_STATIC_WEB_APPS_API_TOKEN` — from Terraform output after first `infra` run

### Bootstrap Infrastructure

```bash
cd infra
terraform init
terraform plan
terraform apply
```

After apply, grab the SWA deployment token:

```bash
terraform output -raw static_web_app_api_key
```

Add that value as the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in your GitHub repo.

### DNS Configuration

Point your domain registrar at the Azure SWA:
- `dayfornight.dev` → CNAME to the SWA default hostname
- `www.dayfornight.dev` → CNAME to the SWA default hostname

The SWA default hostname is output by Terraform as `static_web_app_url`.

## Multi-Era Architecture

The site hosts multiple archived snapshots of the festival site (2015–2017), each faithfully reconstructed from Wayback Machine snapshots.

### Randomized Landing Rotation

The root URL uses in-place content swap: `src/pages/index.astro` randomly picks a snapshot, fetches its HTML, injects a `<base>` tag, and renders via `document.write`. Selection uses `sessionStorage` with a 20-minute per-snapshot cooldown. When all entries are in cooldown, it falls back to the least-recently-seen one.

Current rotation pool: `/2015/`, `/2015/splash/`, `/2015/recap/`, `/2016/`, `/2016/lineup/`, `/2016/recap/`, `/2017/`, `/2017/lineup/`

### Data Architecture

| Year | Layout | Data File(s) | Content Pipeline |
|------|--------|--------------|------------------|
| 2015 | `Flora2015Layout.astro` | `snapshot-2015.json`, Content Collections (`src/content/2015/artists/*.md`) | `scripts/extract-content.js` → Markdown + JSON |
| 2016 | `Dfn2016Layout.astro`, `Dfn2016LineupLayout.astro` | `snapshot-2016.json`, `snapshot-2016-lineup.json`, `snapshot-2016-recap.json`, `snapshot-2016-subpages.json` | Manual extraction from snapshots |
| 2017 | `Dfn2017Layout.astro` | `snapshot-2017.json`, `about-2017.html` | Manual extraction + Wayback Machine artist bio recovery |

### 2017 Artist Recovery

The original 2017 site had 93 lineup artists but only 20 had detail pages in the canonical snapshot (`20171222234154`). The remaining 72 artist bios, images, and schedule data were recovered from Wayback Machine captures (2017–2019) via CDX API queries and HTML extraction. Two artists (Collin Hedrick, LIMB) had no bio content on the original site; minimal one-line fallback descriptions were added.

### Font Sharing

The 2016 and 2017 eras use identical GT-Cinetype font files (Light, Regular, Bold). The 2017 CSS references fonts at `/shared-assets/2016/fonts/` to avoid duplication. The `public/shared-assets/2017/fonts/` directory was removed.

## Deployment

Pushing to `main` triggers automatic deployment via GitHub Actions.
Infrastructure changes in `infra/` trigger a Terraform plan (PRs) or apply (main).
