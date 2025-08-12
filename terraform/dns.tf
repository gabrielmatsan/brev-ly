resource "cloudflare_dns_record" "api-dns-record" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  content = aws_lb.alb.dns_name
  type    = "CNAME"
  ttl     = 60
  proxied = false

  depends_on = [aws_lb_listener.alb-listener-https]
}

# resource "cloudflare_dns_record" "www" {
#   zone_id = var.cloudflare_zone_id
#   name = "www"
#   #content = aws_lb.alb.dns_name colocar o frontend-> cloudfront ou amplify
#   type = "CNAME"
#   ttl = 60
#   proxied = false

#   depends_on = [aws_lb_listener.alb-listener-https]
# }