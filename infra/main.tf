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
