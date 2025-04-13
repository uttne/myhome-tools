data "aws_region" "current" {}

output "cognito_region" {
  description = "Cognito が配置されているリージョン"
  value       = data.aws_region.current.name
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.myhome_pool.id
}

output "cognito_user_pool_web_client_id" {
  description = "Cognito User Pool Web Client ID"
  value       = aws_cognito_user_pool_client.myhome_client.id
}