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
