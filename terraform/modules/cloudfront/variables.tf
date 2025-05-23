variable "s3_origin_domain" {
  description = "S3 オリジンのドメイン名"
  type        = string
}

variable "s3_contents_origin_domain" {
  description = "コンテンツ用 S3 オリジンのドメイン名"
  type        = string
}

variable "api_gateway_endpoint" {
  description = "API Gateway のエンドポイント URL"
  type        = string
}

variable "default_root_object" {
  description = "CloudFront のデフォルトルートオブジェクト"
  type        = string
  default     = "index.html"
}

variable "oai_comment" {
  description = "CloudFront OAI のコメント"
  type        = string
  default     = "OAI for SPA S3 bucket"
}

variable "lambda_edge_function_version_arn" {
  description = "Lambda@Edge の関数 ARN"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM 証明書の ARN"
  type        = string
  default     = ""
}

variable "base_domain" {
  description = "ベースとなるドメイン（例: example.com）"
  type        = string
}

variable "subdomain" {
  description = "サブドメイン（例: subdomain.example.com の subdomain 部分）"
  type        = string
}