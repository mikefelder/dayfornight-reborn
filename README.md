# dayfornight.dev

Archival site for Day for Night festival — deployed to Azure Static Web Apps via Astro.

## Routes

| Path | Content |
|------|---------|
| `/` | Random rotation across all available snapshots (session-based cooldown) |
| `/2015/` | 2015 festival lineup (Flora theme archive) |
| `/2015/splash` | Original splash/holding page |
| `/2015/recap/` | Post-festival recap site (March 2016 snapshot) |
| `/2015/artists/:slug` | Individual artist pages |
| `/2015/info` | Festival info |
| `/2015/schedule` | Schedule |
| `/2016/` | 2016 blind-presale page (video hero, lineup teasers, YouTube lightbox) |
| `/2016/lineup/` | 2016 full lineup site with time-of-day gradient system |

## Structure

```
src/            → Astro source (pages, layouts, components, content)
public/         → Static assets copied to build output as-is
  shared-assets/2015/  → Images, CSS, fonts for the 2015 archive
  shared-assets/2016/  → Images, CSS, fonts, videos for the 2016 archive
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

The site will host multiple archived snapshots of the festival site (one per year/phase).

### URL Structure

```
/              → Random rotation (serves one snapshot inline via fetch + document.write)
/2015/         → 2015 full lineup site (Astro-native from Flora theme)
/2015/splash/  → Original holding page (static HTML)
/2015/recap/   → Post-show recap (static Wayback snapshot)
/2016/         → 2016 blind-presale page (Astro-native)
/2016/lineup/  → 2016 full lineup with time-based gradients (Astro-native)
```

Future phases:

```
/2016/recap/   → Post-festival recap (when converted)
/2017/         → 2017 main site
/2018/         → 2018 main site
```

### Randomized Landing Rotation

The root URL uses in-place content swap: `src/pages/index.astro` randomly picks a snapshot, fetches its HTML, injects a `<base>` tag, and renders via `document.write`. Selection uses `sessionStorage` with a 20-minute per-snapshot cooldown. When all entries are in cooldown, it falls back to the least-recently-seen one.

Current rotation pool: `/2015/`, `/2015/splash/`, `/2015/recap/`, `/2016/`, `/2016/lineup/`

## Deployment

Pushing to `main` triggers automatic deployment via GitHub Actions.
Infrastructure changes in `infra/` trigger a Terraform plan (PRs) or apply (main).
