output "bucket_id" {
  value = aws_s3_bucket.content_bucket.id
}

output "bucket_arn" {
  value = aws_s3_bucket.content_bucket.arn
}

output "bucket_regional_domain_name" {
  value = aws_s3_bucket.content_bucket.bucket_regional_domain_name
}