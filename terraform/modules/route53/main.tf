data "aws_route53_zone" "primary_zone" {
  name         = var.base_domain
  private_zone = false
}

locals {
  full_subdomain = "${var.subdomain}.${var.base_domain}"
}

resource "aws_route53_record" "subdomain_alias" {
  zone_id = data.aws_route53_zone.primary_zone.zone_id
  name    = local.full_subdomain # 組み立てたサブドメイン名（例: app.example.com）
  type    = "A"

  alias {
    name                   = var.cloudfront_domain # CloudFront の出力（例: dxxxxxxxxxx.cloudfront.net）
    zone_id                = "Z2FDTNDATAQYW2"      # CloudFront 固有のホストゾーンID
    evaluate_target_health = false
  }
}
