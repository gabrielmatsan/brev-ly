terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  backend "s3" {
    bucket  = "brev-ly-backend-bucket"
    key     = "terraform.tfstate"
    region  = "us-east-1"
    encrypt = true

  }
}

provider "aws" {
  region = "us-east-1"
}


resource "aws_s3_bucket" "backend-bucket" {
  bucket = "${var.application_name}-backend-bucket"


  tags = {
    Name = "${var.application_name}-backend-bucket"
    IAC  = "true"
  }
}


resource "aws_s3_bucket_versioning" "backend-bucket-versioning" {
  bucket = aws_s3_bucket.backend-bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "backend-bucket-pab" {
  bucket = aws_s3_bucket.backend-bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


resource "aws_s3_bucket_policy" "backend-bucket-policy" {
  bucket = aws_s3_bucket.backend-bucket.id

  policy = jsonencode({
    Version = "2012-10-17" # Versão da linguagem de política AWS
    Statement = [          # Lista de regras (você tem 1 regra)
      {
        Sid       = "DenyInsecureConnections"     # Nome da regra (identificação)
        Effect    = "Deny"                        # NEGAR (bloquear)
        Principal = "*"                           # Para QUALQUER pessoa/serviço
        Action    = "s3:*"                        # TODAS as ações do S3
        Resource = [                              # Nos seguintes recursos:
          aws_s3_bucket.backend-bucket.arn,       # No bucket
          "${aws_s3_bucket.backend-bucket.arn}/*" # Nos objetos dentro do bucket
        ]
        Condition = { # QUANDO a condição for verdadeira:
          Bool = {
            "aws:SecureTransport" = "false" # Conexão NÃO é HTTPS
          }
        }
      }
    ]
  })
}


resource "aws_s3_bucket_server_side_encryption_configuration" "backend-bucket-encryption" {
  bucket = aws_s3_bucket.backend-bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}