variable "s3_origin_domain" {
  description = "S3 オリジンのドメイン名"
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