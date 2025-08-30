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
    username = var.github_username
    password = var.github_token
  })
}