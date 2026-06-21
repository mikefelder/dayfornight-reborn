resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}"
  location = var.location
  tags     = var.tags
}

resource "azurerm_static_web_app" "site" {
  name                = "swa-${var.project_name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = var.tags
}

# --- Asset Storage (Blob) ---

resource "azurerm_storage_account" "assets" {
  name                     = "dfnassets"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  min_tls_version          = "TLS1_2"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD", "OPTIONS"]
      allowed_origins    = ["https://dayfornight.dev", "https://www.dayfornight.dev"]
      exposed_headers    = ["Content-Length", "Content-Type"]
      max_age_in_seconds = 86400
    }
  }

  tags = var.tags
}

resource "azurerm_storage_account_static_website" "assets" {
  storage_account_id = azurerm_storage_account.assets.id
  index_document     = "index.html"
  error_404_document = "404.html"
}

# Custom domain for assets (optional, enable when ready to cut over)
# resource "azurerm_cdn_profile" "assets" {
#   name                = "cdn-dfn-assets"
#   resource_group_name = azurerm_resource_group.main.name
#   location            = "global"
#   sku                 = "Standard_Microsoft"
#   tags                = var.tags
# }
#
# resource "azurerm_cdn_endpoint" "assets" {
#   name                = "dfn-assets"
#   profile_name        = azurerm_cdn_profile.assets.name
#   resource_group_name = azurerm_resource_group.main.name
#   location            = "global"
#   origin_host_header  = azurerm_storage_account.assets.primary_web_host
#
#   origin {
#     name      = "blob"
#     host_name = azurerm_storage_account.assets.primary_web_host
#   }
# }

# Custom domains
import {
  to = azurerm_static_web_app_custom_domain.apex
  id = "/subscriptions/1784740a-1cf6-416b-b3db-bda6985970aa/resourceGroups/rg-dayfornight/providers/Microsoft.Web/staticSites/swa-dayfornight/customDomains/dayfornight.dev"
}

resource "azurerm_static_web_app_custom_domain" "apex" {
  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = var.custom_domain
  validation_type   = "dns-txt-token"
}

import {
  to = azurerm_static_web_app_custom_domain.www
  id = "/subscriptions/1784740a-1cf6-416b-b3db-bda6985970aa/resourceGroups/rg-dayfornight/providers/Microsoft.Web/staticSites/swa-dayfornight/customDomains/www.dayfornight.dev"
}

resource "azurerm_static_web_app_custom_domain" "www" {
  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = "www.${var.custom_domain}"
  validation_type   = "cname-delegation"
}
