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
