resource "cloudflare_dns_record" "api-dns-record" {
  zone_id = var.cloudflare_zone_id
  name = var.api_domain_name
  content = aws_lb.alb.dns_name
  type = "CNAME"
  ttl = 60
  proxied = false

  depends_on = [aws_lb_listener.alb-listener-https]
}