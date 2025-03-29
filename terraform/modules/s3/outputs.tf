output "bucket_id" {
  value = aws_s3_bucket.spa_bucket.id
}

output "bucket_arn" {
  value = aws_s3_bucket.spa_bucket.arn
}

output "bucket_regional_domain_name" {
  value = aws_s3_bucket.spa_bucket.bucket_regional_domain_name
}