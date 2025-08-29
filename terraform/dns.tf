resource "cloudflare_dns_record" "api-dns-record" {
  zone_id = var.cloudflare_zone_id # zone_id do cloudflare
  name    = "api"                  # nome do registro
  content = aws_lb.alb.dns_name    # dns_name do alb
  type    = "CNAME"                # tipo de registro
  ttl     = 60                     # ttl do registro
  proxied = false                  # se o registro é proxyado pelo cloudflare

  depends_on = [aws_lb_listener.alb-listener-https] # depende do alb-listener-https
}

# Registro DNS para o frontend via CloudFront (usando CNAME flattening do Cloudflare)
resource "cloudflare_dns_record" "frontend_dns_record" {
  zone_id = var.cloudflare_zone_id
  name    = "brev-ly.uk" # Domínio raiz
  content = module.cloudfront_distribution.cloudfront_distribution_domain_name
  type    = "CNAME"
  ttl     = 1    # TTL automático do Cloudflare
  proxied = true # Habilita o proxy do Cloudflare para CNAME flattening

  depends_on = [module.cloudfront_distribution]
}

# Registro DNS para www redirecionando para o CloudFront
resource "cloudflare_dns_record" "www_dns_record" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  content = module.cloudfront_distribution.cloudfront_distribution_domain_name
  type    = "CNAME"
  ttl     = 60
  proxied = false

  depends_on = [module.cloudfront_distribution]
}