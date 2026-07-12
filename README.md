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
| `/2017/presale/` | 2017 "BPS Starts Now" presale page (animated-GIF stand-in for the lost Vimeo background) | manual reconstruction |
| `/2018/` | 2018 homepage (the 2017 festival, captured Oct 2018) | `20181016055202` |
| `/2018/lineup/`, `/2018/sound/:slug`, `/2018/light/:slug`, `/2018/talks/:slug` | 2018 lineup + artist detail pages | `20181016055202` |
| `/2018/about/`, `/2018/schedule/`, `/2018/media/`, `/2018/faq/`, `/2018/contact/` | 2018 subpages | `20181016055202` |

**Build output:** 366 pages.

A fixed **year-navigation pill** (bottom-right) appears on every snapshot page for
chronological prev/next stepping between show-year states. See
[Year-Navigation Pill](#year-navigation-pill).

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

Current rotation pool: `/2015/`, `/2015/splash/`, `/2015/recap/`, `/2016/`, `/2016/lineup/`, `/2016/recap/`, `/2017/presale/`, `/2017/`, `/2018/`

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

### Year-Navigation Pill

Every built snapshot page renders a fixed pill in the bottom-right corner
(`src/components/YearRotationPill.astro`) that lets visitors step through the
festival timeline chronologically. It reads its ordered snapshot list from
`src/data/show-years.ts` (`liveSnapshots`) and derives the current position from
the page URL.

- The `←` / `→` arrows link to the previous/next snapshot in chronological
  order (2015 Splash → Main → Recap → 2016 Presale → Lineup → Recap →
  2017 Presale → Main → 2018).
- The center chip (e.g. `DFN 2017`) is a **non-clickable label**, not a link —
  only the arrows navigate.

The pill is injected via `BaseLayout.astro` (which every year layout wraps). Two
standalone pages that bypass `BaseLayout` include it directly: the 2015 splash
(`public/2015/splash/index.html`, hand-authored markup) and the 2017 presale page
(`src/pages/2017/presale/index.astro`, imports the component).

## Known Gaps & Archival Notes

This is an archival reconstruction from Wayback Machine captures. A full
link/asset audit across all 366 pages found the site otherwise complete — every
referenced local asset is present and there are no broken internal links — but a
few original assets could not be recovered and some third-party embeds no longer
resolve.

### Missing / dead assets

- **2015 hero banner** — the original `banner-photo-120415.jpg` was never archived
  (the only surviving copy is a 142 KB Wayback HTML error page saved with a `.jpg`
  extension). The `/2015/` hero now shows the Day For Night wordmark logo
  (`DAY_FOR_NIGHT_LOGO.png`) as a stand-in.
- **`shop.dayfornight.io`** — linked as "Shop" in the 2018 footer; the subdomain no
  longer resolves. Left in place for period accuracy.
- **Splash social links** — the 2015 splash's Instagram and Twitter icons link to
  the live accounts; the Facebook icon is an intentional `#` dead-end.

### Missing Vimeo videos

These background/feature videos are embedded via `player.vimeo.com` but no longer
load (the source videos are now private, domain-restricted, or removed), so they
render as empty embeds. **They can be restored** by downloading each source video
and either self-hosting it under `public/shared-assets/<year>/videos/` or swapping
the embed for a poster image + click-through link.

| Vimeo ID | Source URL | Embedded on |
|----------|-----------|-------------|
| `182770858` | https://vimeo.com/182770858 | `/2016/lineup/` |
| `198700839` | https://vimeo.com/198700839 | `/2016/recap/`, `/2017/media/`, `/2018/media/` |
| `234390890` | https://vimeo.com/234390890 | `/2017/about/`, `/2018/about/` |
| `176511637` | https://vimeo.com/176511637 | `/2017/media/`, `/2018/media/` |
| `176511792` | https://vimeo.com/176511792 | `/2017/media/`, `/2018/media/` |
| `176512624` | https://vimeo.com/176512624 | `/2017/media/`, `/2018/media/` |
| `180189822` | https://vimeo.com/180189822 | `/2017/media/`, `/2018/media/` |
| `180229453` | https://vimeo.com/180229453 | `/2017/media/`, `/2018/media/` |
| `187376150` | https://vimeo.com/187376150 | `/2017/media/`, `/2018/media/` |
| `191990862` | https://vimeo.com/191990862 | `/2017/media/`, `/2018/media/` |
| `213247906` | https://vimeo.com/213247906 | `/2017/media/`, `/2018/media/` |
| `223347619` | https://vimeo.com/223347619 | `/2017/media/`, `/2018/media/` |
| `223486322` | https://vimeo.com/223486322 | `/2017/media/`, `/2018/media/` |
| `234597099` | https://vimeo.com/234597099 | `/2017/media/`, `/2018/media/` |

The 2017 presale "BPS Starts Now" background video (Vimeo `233762596`) is also
gone; that page already uses an animated-GIF stand-in.

## Deployment

Pushing to `main` triggers automatic deployment via GitHub Actions.
Infrastructure changes in `infra/` trigger a Terraform plan (PRs) or apply (main).
