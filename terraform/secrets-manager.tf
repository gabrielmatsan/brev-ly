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
  })
}