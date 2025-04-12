locals {
  full_subdomain = "${var.subdomain}.${var.base_domain}"
}

resource "aws_cloudfront_function" "spa_function" {
  name    = "SPAFunction"
  runtime = "cloudfront-js-2.0"
  comment = "SPA を構成するための CloudFront Function"
  publish = true
  code    = file("${path.module}/functions/spa.js")
}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = var.oai_comment
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = var.s3_origin_domain
    origin_id   = "S3-SPA-Origin"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = replace(var.api_gateway_endpoint, "https://", "")
    origin_id   = "APIGateway-Origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = var.s3_contents_origin_domain
    origin_id   = "S3-Contents-Origin"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id       = "S3-SPA-Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    // /api/* と /contents/* では存在しない場合にエラーを返すようにするため、
    // CustomErrorResponse を設定せずに CloudFront Function を利用する。
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa_function.arn
    }
    
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "APIGateway-Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  ordered_cache_behavior {
    path_pattern           = "/contents/*"
    target_origin_id       = "S3-Contents-Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
      headers = ["Authorization"]
    }
    lambda_function_association {
      event_type = "viewer-request"
      lambda_arn = var.lambda_edge_function_version_arn
      include_body = false
    }
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for SPA and API"
  default_root_object = var.default_root_object
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  
  aliases = [ local.full_subdomain ]

  viewer_certificate {
    acm_certificate_arn = var.acm_certificate_arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
    # cloudfront_default_certificate = true  # ACM 証明書を使用する場合は false にする
    cloudfront_default_certificate = false
  }
  tags = {
    Project = "MYHOME_TOOLS"
  }
}