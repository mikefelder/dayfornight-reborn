variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "centralus"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "dayfornight"
}

variable "custom_domain" {
  description = "Custom domain for the static site"
  type        = string
  default     = "dayfornight.dev"
}

variable "tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default = {
    project     = "dayfornight"
    environment = "production"
    managed_by  = "terraform"
  }
}
