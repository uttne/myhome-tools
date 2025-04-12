provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  full_subdomain = "${var.subdomain}.${var.base_domain}"
}

data "aws_route53_zone" "primary_zone" {
  name         = var.base_domain
  private_zone = false
}

resource "aws_acm_certificate" "custom_cert" {
  provider          = aws.us_east_1
  domain_name       = local.full_subdomain # 例: app.example.com
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Project = "MYHOME_TOOLS"
  }
}

# DNS 検証用の Route53 レコードを作成する例
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.custom_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }
  zone_id = data.aws_route53_zone.primary_zone.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert_validation" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.custom_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
