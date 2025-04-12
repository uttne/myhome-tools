resource "aws_cognito_user_pool" "myhome_pool" {
  name = "myhome-user-pool"

  username_attributes       = ["email"]
  auto_verified_attributes  = ["email"]

  password_policy {
    minimum_length    = 8
    require_uppercase = false
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
  }

  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_cognito_user_pool_client" "myhome_client" {
  name                             = "myhome-spa-client"
  user_pool_id                     = aws_cognito_user_pool.myhome_pool.id
  generate_secret                  = false
  allowed_oauth_flows              = ["implicit", "code"]
  allowed_oauth_scopes             = ["openid", "email", "profile"]
  callback_urls                    = ["https://${var.app_domain}/auth/login"]
  logout_urls                      = ["https://${var.app_domain}/"]
  supported_identity_providers     = ["COGNITO"]
  allowed_oauth_flows_user_pool_client = true
}

data "http" "cognito_jwks" {
  url = "https://${aws_cognito_user_pool.myhome_pool.endpoint}/.well-known/jwks.json"
}

output "issuer" {
  value = aws_cognito_user_pool.myhome_pool.endpoint
}

output "jwks" {
  value = data.http.cognito_jwks.response_body
}

output "client_id" {
  value = aws_cognito_user_pool_client.myhome_client.id
}

output "user_pool_id" {
  value = aws_cognito_user_pool.myhome_pool.id
}