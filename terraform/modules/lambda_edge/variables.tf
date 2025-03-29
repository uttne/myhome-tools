variable "cloudfront_domain" {
  description = "CloudFront のドメイン"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito User Pool Client の ID"
  type        = string
}

variable "cognito_issuer" {
  description = "Cognito の Issuer URL"
  type        = string
}

variable "cognito_jwks" {
  description = "Cognito の JWKS レスポンス"
  type        = string
}

variable "lambda_edge_source" {
  description = "Lambda@Edge 用テンプレートファイルのパス"
  type        = string
}

variable "lambda_role_arn" {
  description = "Lambda@Edge 用の IAM ロール ARN"
  type        = string
}