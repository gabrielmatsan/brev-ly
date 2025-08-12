variable "application_name" {
  type        = string
  default     = "brev-ly"
  description = "The name of the application"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "The region of the application"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "github_username" {
  description = "GitHub username"
  type        = string
}

variable "github_token" {
  description = "GitHub personal access token"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
  default     = "auto"
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "api_domain_name" {
  description = "API domain name"
  type        = string
}