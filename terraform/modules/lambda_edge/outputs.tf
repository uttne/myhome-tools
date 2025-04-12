output "lambda_edge_function_arn" {
  value = aws_lambda_function.check_auth_lambda.arn
}

output "lambda_edge_function_version_arn" {
  value = aws_lambda_function.check_auth_lambda.qualified_arn
}