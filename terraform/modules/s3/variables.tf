variable "bucket_name" {
  description = "S3 バケットの名前"
  type        = string
}

variable "spa_source_dir" {
  description = "SPA のビルド済みファイルのディレクトリパス"
  type        = string
}

variable "cloudfront_s3_canonical_user_id" {
  description = "CloudFront の OAI ARN（バケットポリシー用）"
  type        = string
}