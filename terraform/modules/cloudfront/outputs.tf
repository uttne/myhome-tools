output "domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "oai_arn" {
  value = aws_cloudfront_origin_access_identity.oai.iam_arn
}

output "cloudfront_s3_canonical_user_id" {
  value = aws_cloudfront_origin_access_identity.oai.s3_canonical_user_id
  description = "CloudFront の OAI ARN（バケットポリシー用）"
}