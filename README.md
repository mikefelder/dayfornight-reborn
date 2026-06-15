# dayfornight.dev

Archival site for Day for Night festival — deployed to Azure Static Web Apps via Astro.

## Routes

| Path | Content |
|------|---------|
| `/` | Random redirect to one of the snapshots |
| `/2015/` | 2015 festival lineup (Flora theme archive) |
| `/2015/splash` | Original splash/holding page |
| `/2015/recap/` | Post-festival recap site (March 2016 snapshot) |
| `/2015/artists/:slug` | Individual artist pages |
| `/2015/info` | Festival info |
| `/2015/schedule` | Schedule |

## Structure

```
src/            → Astro source (pages, layouts, components, content)
public/         → Static assets copied to build output as-is
  shared-assets/2015/  → Images, CSS, fonts for the 2015 archive
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
/              → splash / landing page
/2015/         → 2015 main site
/2016/         → 2016 main site
/2017/         → 2017 main site
/2018/         → 2018 main site
```

Phases within a year (if distinct snapshots exist):

```
/2017/presale/ → presale teaser
/2017/         → show-time (full lineup)
/2017/recap/   → post-show
```

### Randomized Landing Options

When all eras are deployed, the root URL could randomly surface a different year:

**Option A: Client-side redirect** — Root `index.html` picks a random year via JS and calls `window.location.replace()`. Simple, no backend, but URL changes and there's a brief flash.

**Option B: In-place content swap** — Root stays at `/` and fetches a random year's page into the DOM. Complex and fragile with full archive snapshots that have their own CSS/JS.

**Option C: Server-side 302 via Azure Functions** — A linked SWA API function at `/api/random` returns a 302 to a random year. Rewrite `/` → `/api/random` in `staticwebapp.config.json`. Cleanest UX (no flash), but requires a Functions backend.

**Option D: Splash with random entry button** — Splash page stays stable with an "Enter" or "Explore" button that randomly navigates to a year. Preserves a consistent landing page while still offering discovery.

## Local Development

```bash
cd site && python3 -m http.server 8000
```

## Deployment

Pushing to `main` with changes in `site/` triggers automatic deployment via GitHub Actions.
Infrastructure changes in `infra/` trigger a Terraform plan (PRs) or apply (main).
