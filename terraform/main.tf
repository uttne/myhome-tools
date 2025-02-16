# AWS プロバイダーの設定（東京リージョン）
provider "aws" {
  region = "ap-northeast-1"
}

#############################
# S3 バケット関連リソース
#############################

# SPA 用の S3 バケットを作成
resource "aws_s3_bucket" "spa_bucket" {
  bucket = "myhome-tools-bucket"
  tags = {
    Project = "MYHOME_TOOLS" # タグでプロジェクト名を設定
  }
}

# S3 バケットのオブジェクト所有権のコントロールを設定
resource "aws_s3_bucket_ownership_controls" "spa_bucket" {
  bucket = aws_s3_bucket.spa_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred" # バケット所有者を優先する設定
  }
}

# S3 バケットの ACL（アクセス制御リスト）を設定
resource "aws_s3_bucket_acl" "spa_bucket" {
  # 依存関係: 所有権のコントロールが先に適用されることを保証
  depends_on = [aws_s3_bucket_ownership_controls.spa_bucket]
  bucket     = aws_s3_bucket.spa_bucket.id
  acl        = "private" # バケットを非公開に設定
}

# S3 バケットポリシーで CloudFront のアクセスを許可
resource "aws_s3_bucket_policy" "spa_bucket" {
  bucket = aws_s3_bucket.spa_bucket.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess",
        Effect = "Allow",
        # CloudFront の OAI（Origin Access Identity）からのアクセスを許可
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        },
        Action   = "s3:GetObject",
        Resource = "${aws_s3_bucket.spa_bucket.arn}/*" # バケット内のすべてのオブジェクトに適用
      }
    ]
  })
}

#############################
# CloudFront 関連リソース
#############################

# CloudFront のオリジンアクセスアイデンティティ（OAI）の作成
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for SPA S3 bucket" # 説明用のコメント
}

#############################
# IAM 関連リソース（Lambda 用のロールなど）
#############################

# Lambda 用の AssumeRole ポリシードキュメントを作成
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Lambda 実行用の IAM ロールを作成
resource "aws_iam_role" "lambda_exec_role" {
  name               = "myhome_tools_lambda_exec_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

# Lambda の基本実行ポリシーを IAM ロールにアタッチ
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

#############################
# Lambda 関数と API Gateway 関連リソース
#############################

# Lambda 関数を作成（API のバックエンドとして利用）
resource "aws_lambda_function" "api_function" {
  function_name    = "myhome-tools-function"
  role             = aws_iam_role.lambda_exec_role.arn
  runtime          = "python3.13"
  handler          = "lambda_function.lambda_handler"
  filename         = "lambda_function.zip" # Lambda のデプロイパッケージ（ZIP ファイル）
  source_code_hash = filebase64sha256("lambda_function.zip")
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

# API Gateway v2 の HTTP API を作成
resource "aws_apigatewayv2_api" "http_api" {
  name          = "myhome-tools-api"
  protocol_type = "HTTP"
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

# API Gateway と Lambda 関数を統合するための設定
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api_function.invoke_arn
  payload_format_version = "2.0"
}

# API Gateway のルート設定（/api 以下のリクエストを Lambda 関数に転送）
resource "aws_apigatewayv2_route" "lambda_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway のステージをデフォルトで作成し自動デプロイを有効化
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

# API Gateway から Lambda 関数を呼び出すための権限を付与
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

#############################
# CloudFront Distribution（CDN）設定
#############################

resource "aws_cloudfront_distribution" "cdn" {
  # オリジン: S3 バケットから SPA ファイルを配信
  origin {
    domain_name = aws_s3_bucket.spa_bucket.bucket_regional_domain_name
    origin_id   = "S3-SPA-Origin"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # オリジン: API Gateway から API を配信
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

  # デフォルトのキャッシュ動作: SPA 用 S3 オリジンを使用
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
    # キャッシュを無効化するため TTL を 0 に設定
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # Ordered Cache Behavior: /api/* パスのリクエストは API Gateway に転送
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
    # キャッシュを無効化するため TTL を 0 に設定
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for SPA and API"
  default_root_object = "index.html" # ルートアクセス時に返すオブジェクト
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

#############################
# ローカルファイルの設定
#############################

locals {
  # SPA のビルド済みファイルが配置されているディレクトリのパス
  spa_source_dir = "${path.module}/../front/dist"
  # spa_source_dir 以下のすべてのファイルを対象にする
  spa_files = fileset(local.spa_source_dir, "**/*")
  # ファイル拡張子から対応する MIME タイプへのマッピング
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

# SPA の各ファイルを S3 にオブジェクトとしてアップロード
resource "aws_s3_object" "spa_objects" {
  for_each = { for file in local.spa_files : file => file }
  bucket   = aws_s3_bucket.spa_bucket.id
  key      = each.value
  source   = "${local.spa_source_dir}/${each.value}"
  etag     = filemd5("${local.spa_source_dir}/${each.value}")

  # 各ファイルの Content-Type を拡張子に応じて設定
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
