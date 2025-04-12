variable "base_domain" {
  description = "ベースとなるドメイン（例: example.com）"
  type        = string
}

variable "subdomain" {
  description = "サブドメイン（例: subdomain.example.com の subdomain 部分）"
  type        = string
}

variable "cloudfront_domain" {
  description = "CloudFront のドメイン名（例: d1234567890abcdef.cloudfront.net）"
  type        = string
}
