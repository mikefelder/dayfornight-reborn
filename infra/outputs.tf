output "static_web_app_url" {
  description = "Default URL of the Static Web App"
  value       = azurerm_static_web_app.site.default_host_name
}

output "static_web_app_api_key" {
  description = "API key for deploying content (use as GitHub secret)"
  value       = azurerm_static_web_app.site.api_key
  sensitive   = true
}

output "static_web_app_id" {
  description = "Resource ID of the Static Web App"
  value       = azurerm_static_web_app.site.id
}

output "assets_storage_account_name" {
  description = "Storage account name for asset uploads"
  value       = azurerm_storage_account.assets.name
}

output "assets_primary_web_endpoint" {
  description = "Static website endpoint for serving assets (use as base URL)"
  value       = azurerm_storage_account.assets.primary_web_endpoint
}

output "assets_primary_web_host" {
  description = "Hostname for the static website endpoint"
  value       = azurerm_storage_account.assets.primary_web_host
}
