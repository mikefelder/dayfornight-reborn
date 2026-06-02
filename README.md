# dayfornight.dev

Static placeholder site for Day for Night — deployed to Azure Static Web Apps.

## Structure

```
site/           → Static site content (deployed to Azure SWA)
infra/          → Terraform for Azure infrastructure
.github/        → CI/CD workflows
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

## Local Development

```bash
cd site && python3 -m http.server 8000
```

## Deployment

Pushing to `main` with changes in `site/` triggers automatic deployment via GitHub Actions.
Infrastructure changes in `infra/` trigger a Terraform plan (PRs) or apply (main).
