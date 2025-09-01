resource "aws_secretsmanager_secret" "github_credentials" {
  name = "${var.application_name}-github-credentials"


  tags = {
    Name = "${var.application_name}-github-credentials"
    IAC  = "true"
  }
}


resource "aws_secretsmanager_secret_version" "github_credentials_version" {
  secret_id = aws_secretsmanager_secret.github_credentials.id
  secret_string = jsonencode({
    username                     = var.github_username
    password                     = var.github_token
    dataport                     = var.dataport
    database_url                 = var.database_url
    frontend_url                 = var.frontend_url
    cloudflare_account_id        = var.cloudflare_account_id
    cloudflare_access_key_id     = var.cloudflare_access_key_id
    cloudflare_secret_access_key = var.cloudflare_secret_access_key
    cloudflare_bucket            = var.cloudflare_bucket
    cloudflare_public_url        = var.cloudflare_public_url
    datadog_api_key               = var.datadog_api_key
    datadog_site                   = var.datadog_site
    datadog_tags                   = var.datadog_tags
    datadog_service                = var.datadog_service
    datadog_env                    = var.datadog_env
    datadog_version                = var.datadog_version
    datadog_trace_enabled          = var.datadog_trace_enabled
    datadog_trace_debug            = var.datadog_trace_debug
    datadog_trace_startup_logs     = var.datadog_trace_startup_logs
    datadog_logs_injection          = var.datadog_logs_injection
    datadog_runtime_metrics_enabled = var.datadog_runtime_metrics_enabled
    datadog_profiling_enabled      = var.datadog_profiling_enabled
  })
}