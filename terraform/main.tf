provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_s3_bucket" "spa_bucket" {
  bucket = "myhome-tools-bucket"
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_s3_bucket_ownership_controls" "spa_bucket" {
  bucket = aws_s3_bucket.spa_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "spa_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.spa_bucket]
  bucket     = aws_s3_bucket.spa_bucket.id
  acl        = "private"
}

resource "aws_s3_bucket_policy" "spa_bucket" {
  bucket = aws_s3_bucket.spa_bucket.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess",
        Effect = "Allow",
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        },
        Action   = "s3:GetObject",
        Resource = "${aws_s3_bucket.spa_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for SPA S3 bucket"
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_exec_role" {
  name               = "myhome_tools_lambda_exec_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "api_function" {
  function_name    = "myhome-tools-function"
  role             = aws_iam_role.lambda_exec_role.arn
  runtime          = "python3.13"
  handler          = "lambda_function.lambda_handler"
  filename         = "lambda_function.zip"
  source_code_hash = filebase64sha256("lambda_function.zip")

  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "myhome-tools-api"
  protocol_type = "HTTP"
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api_function.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "lambda_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.spa_bucket.bucket_regional_domain_name
    origin_id   = "S3-SPA-Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = replace(aws_apigatewayv2_api.http_api.api_endpoint, "https://", "")
    origin_id   = "APIGateway-Origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
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

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for SPA and API"
  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Project = "MYHOME_TOOLS"
  }
}

locals {
  spa_source_dir = "${path.module}/../front/dist"
  spa_files      = fileset(local.spa_source_dir, "**/*")
  mime_types = {
    html = "text/html"
    htm  = "text/html"
    css  = "text/css"
    js   = "application/javascript"
    json = "application/json"
    png  = "image/png"
    jpg  = "image/jpeg"
    jpeg = "image/jpeg"
    svg  = "image/svg+xml"
  }
}

resource "aws_s3_object" "spa_objects" {
  for_each = { for file in local.spa_files : file => file }

  bucket = aws_s3_bucket.spa_bucket.id
  key    = each.value
  source = "${local.spa_source_dir}/${each.value}"
  etag   = filemd5("${local.spa_source_dir}/${each.value}")

  content_type = try(
    lookup(
      local.mime_types,
      regex(".*[.]([^.]*)$", each.value)[0],
      "application/octet-stream"
    ),
    "application/octet-stream"
  )

  tags = {
    Project = "MYHOME_TOOLS"
  }
}
