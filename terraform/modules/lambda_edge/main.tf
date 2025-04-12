# data "template_file" "check_auth_lambda" {
#   template = file(var.lambda_edge_source)
#   vars = {
#     cloudfront_domain     = var.cloudfront_domain
#     cognito_client_id     = var.cognito_client_id
#     cognito_user_pool_id  = var.cognito_user_pool_id
#   }
# }

locals {
  template = file(var.lambda_edge_source)
  replaced = replace(
    replace(
      replace(
        local.template,
        "__CLOUDFRONT_DOMAIN__", var.cloudfront_domain
      ),
      "__COGNITO_CLIENT_ID__", var.cognito_client_id
    ),
    "__COGNITO_USER_POOL_ID__", var.cognito_user_pool_id
  )
}

resource "local_file" "check_auth_lambda_ts" {
  depends_on = [local.replaced]
  content  = local.replaced
  filename = "${path.module}/generated/index.mjs"
}

data "archive_file" "check_auth_lambda_zip" {
  depends_on = [local_file.check_auth_lambda_ts]
  type        = "zip"
  source_file = "${path.module}/generated/index.mjs"
  output_path = "${path.module}/generated/index.zip"
}

resource "aws_lambda_function" "check_auth_lambda" {
  depends_on       = [data.archive_file.check_auth_lambda_zip]
  function_name    = "check-auth"
  role             = var.lambda_role_arn
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  filename         = data.archive_file.check_auth_lambda_zip.output_path
  source_code_hash = data.archive_file.check_auth_lambda_zip.output_base64sha256
  tags = {
    Project = "MYHOME_TOOLS"
  }
}