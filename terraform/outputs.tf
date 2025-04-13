output "cognito_region" {
  description = "Cognito のリージョン"
  value       = module.cognito.cognito_region
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.cognito_user_pool_id
}

output "cognito_user_pool_web_client_id" {
  description = "Cognito User Pool Web Client ID"
  value       = module.cognito.cognito_user_pool_web_client_id
}