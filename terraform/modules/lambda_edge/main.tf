data "template_file" "check_auth_lambda" {
  template = file(var.lambda_edge_source)
  vars = {
    cloudfront_domain = var.cloudfront_domain
    cognito_client_id = var.cognito_client_id
    cognito_issuer    = var.cognito_issuer
    cognito_jwks      = var.cognito_jwks
  }
}

resource "local_file" "check_auth_lambda_ts" {
  depends_on = [data.template_file.check_auth_lambda]
  content  = data.template_file.check_auth_lambda.rendered
  filename = "${path.module}/generated/check-auth.ts"
}

data "archive_file" "check_auth_lambda_zip" {
  depends_on = [local_file.check_auth_lambda_ts]
  type        = "zip"
  source_file = "${path.module}/generated/check-auth.ts"
  output_path = "${path.module}/generated/check-auth.zip"
}

resource "aws_lambda_function" "check_auth_lambda" {
  depends_on       = [data.archive_file.check_auth_lambda_zip]
  function_name    = "check-auth"
  role             = var.lambda_role_arn
  runtime          = "nodejs18.x"
  handler          = "check-auth.handler"
  filename         = data.archive_file.check_auth_lambda_zip.output_path
  source_code_hash = data.archive_file.check_auth_lambda_zip.output_base64sha256
  tags = {
    Project = "MYHOME_TOOLS"
  }
}