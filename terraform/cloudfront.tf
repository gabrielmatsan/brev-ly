# S3 Bucket to CDN
resource "aws_s3_bucket" "static_assets" {
  bucket = "${var.application_name}-static-${var.environment}"

  tags = {
    Name        = "${var.application_name}-static-assets"
    Environment = var.environment
    Purpose     = "Static website hosting"
    IAC         = "true"
  }
}

# Versioning configuration
resource "aws_s3_bucket_versioning" "static_assets_versioning" {
  bucket = aws_s3_bucket.static_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}



# Server side encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "static_assets_encryption" {
  bucket = aws_s3_bucket.static_assets.id


  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }

    bucket_key_enabled = true # Habilita o uso de chaves de bucket, reduzindo o custo da criptografia
  }
}

# Public access block, only Cloudfront can access
resource "aws_s3_bucket_public_access_block" "static_assets_pab" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}



# LifeCycle Policy
resource "aws_s3_bucket_lifecycle_configuration" "static_assets_lifecycle" {
  bucket = aws_s3_bucket.static_assets.id

  rule {
    id     = "cleanup_old_versions"
    status = "Enabled"

    # ADICIONAR: filter ou prefix é obrigatório
    filter {
      prefix = "" # Aplica a todas as objects do bucket
    }

    # Remove versions older than 30 days
    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    # Remove incomplete multipart uploads after 1 day
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}


resource "aws_cloudfront_origin_access_control" "static_oac" {
  name                              = "${var.application_name}-static-oac"
  description                       = "Origin Access Control for ${var.application_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CORREÇÃO: Cache policies precisam estar definidas
resource "aws_cloudfront_cache_policy" "html_cache_policy" {
  name        = "${var.application_name}-html-cache"
  comment     = "Low cache policy for HTML files"
  default_ttl = 300
  max_ttl     = 3600
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    query_strings_config {
      query_string_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    cookies_config {
      cookie_behavior = "none"
    }
  }
}

# CORREÇÃO: Response headers policy
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "${var.application_name}-security-headers"

  cors_config {
    access_control_allow_credentials = false
    origin_override                  = true

    access_control_allow_headers {
      items = ["Content-Type", "Authorization"]
    }
    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }
    access_control_allow_origins {
      items = [var.frontend_domain]
    }
    access_control_max_age_sec = 86400
  }
}

# MÓDULO CLOUDFRONT CORRIGIDO
module "cloudfront_distribution" {
  source  = "terraform-aws-modules/cloudfront/aws"
  version = "5.0.0"

  # Configurações básicas
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Static assets for ${var.application_name}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  # Origin S3
  origin = {
    s3_bucket = {
      domain_name              = aws_s3_bucket.static_assets.bucket_regional_domain_name
      origin_id                = "S3-${var.application_name}-static-assets"
      origin_access_control_id = aws_cloudfront_origin_access_control.static_oac.id
    }
  }

  # Aliases para domínios customizados
  aliases = [var.domain_name, "www.${var.domain_name}"]

  # Certificado SSL
  viewer_certificate = {
    acm_certificate_arn            = aws_acm_certificate.alb-certificate.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }

  # Default cache behavior
  default_cache_behavior = {
    target_origin_id           = "S3-${var.application_name}-static-assets"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = aws_cloudfront_cache_policy.html_cache_policy.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
    use_forwarded_values       = false
  }

  # Error pages para SPA
  custom_error_response = [
    {
      error_code            = 404
      response_code         = 200
      response_page_path    = "/index.html"
      error_caching_min_ttl = 0
    },
    {
      error_code            = 403
      response_code         = 200
      response_page_path    = "/index.html"
      error_caching_min_ttl = 0
    }
  ]

  tags = {
    Environment = var.environment
    IAC         = "true"
  }
}

# OBRIGATÓRIO: Bucket Policy para OAC funcionar
resource "aws_s3_bucket_policy" "static_assets_policy" {
  bucket = aws_s3_bucket.static_assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_assets.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = module.cloudfront_distribution.cloudfront_distribution_arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.static_assets_pab]
}

# Outputs do CloudFront
output "cloudfront_distribution_id" {
  description = "ID da distribuição CloudFront"
  value       = module.cloudfront_distribution.cloudfront_distribution_id
}

output "cloudfront_distribution_domain_name" {
  description = "Domain name da distribuição CloudFront"
  value       = module.cloudfront_distribution.cloudfront_distribution_domain_name
}

output "cloudfront_distribution_hosted_zone_id" {
  description = "Hosted zone ID da distribuição CloudFront"
  value       = module.cloudfront_distribution.cloudfront_distribution_hosted_zone_id
}

output "s3_bucket_name" {
  description = "Nome do bucket S3 para assets estáticos"
  value       = aws_s3_bucket.static_assets.bucket
}