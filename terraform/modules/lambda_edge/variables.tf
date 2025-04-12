variable "cognito_client_id" {
  description = "Cognito User Pool Client の ID"
  type        = string
}
variable "cognito_user_pool_id" {
  description = "Cognito のユーザープール ID"
  type        = string
}
variable "lambda_edge_source" {
  description = "Lambda@Edge 用テンプレートファイルのパス"
  type        = string
}

variable "lambda_role_arn" {
  description = "Lambda@Edge 用の IAM ロール ARN"
  type        = string
}