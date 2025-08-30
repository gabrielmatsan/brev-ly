resource "aws_acm_certificate" "alb-certificate" {
  domain_name       = "api.${var.domain_name}" # Certificado para API
  validation_method = "DNS"

  # Subdomínios no mesmo certificado
  subject_alternative_names = [
    "*.${var.domain_name}",  # Wildcard: *.brev-ly.uk
    "www.${var.domain_name}" # Opcional: www.brev-ly.uk
  ]


  lifecycle {
    create_before_destroy = true
  }


  tags = {
    Name        = "${var.application_name}-alb-certificate"
    Environment = var.environment
    IAC         = "true"
  }
}


resource "cloudflare_dns_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.alb-certificate.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name  # ← Nome do registro
      value = dvo.resource_record_value # ← Valor do registro  
      type  = dvo.resource_record_type  # ← Tipo (CNAME)
    }
  }

  zone_id = var.cloudflare_zone_id
  name    = trimsuffix(each.value.name, ".${var.domain_name}") # ← Limpar apenas o domínio
  content = trimsuffix(each.value.value, ".")                   # ← Limpar ponto final
  type    = each.value.type
  ttl     = 60    # TTL para o registro (60 segundos)
  proxied = false # false para o registro não ser proxyado pelo Cloudflare, no caso, usaremos a AWS
}

