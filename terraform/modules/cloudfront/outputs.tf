output "domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "oai_arn" {
  value = aws_cloudfront_origin_access_identity.oai.iam_arn
}