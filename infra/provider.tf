terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "d4ntfstate"
    container_name       = "tfstate"
    key                  = "dayfornight.dev.tfstate"
    use_oidc             = true
  }
}

provider "azurerm" {
  features {}
}
