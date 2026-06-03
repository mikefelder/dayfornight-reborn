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

# Custom domains - uncomment after DNS is configured
# Step 1: Point www.dayfornight.dev CNAME → <default_hostname>
# Step 2: Add TXT record _dnsauth.dayfornight.dev → <validation_token from Azure portal>
# Step 3: Uncomment these resources and re-apply

# resource "azurerm_static_web_app_custom_domain" "apex" {
#   static_web_app_id = azurerm_static_web_app.site.id
#   domain_name       = var.custom_domain
#   validation_type   = "dns-txt-token"
# }

# resource "azurerm_static_web_app_custom_domain" "www" {
#   static_web_app_id = azurerm_static_web_app.site.id
#   domain_name       = "www.${var.custom_domain}"
#   validation_type   = "cname-delegation"
# }
