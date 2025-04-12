
output "acm_certificate_arn" {
  value = aws_acm_certificate.custom_cert.arn
  description = "ACM 証明書の ARN"
}