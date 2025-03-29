resource "aws_lambda_function" "api_function" {
  function_name    = "myhome-tools-function"
  role             = var.role_arn
  runtime          = "python3.13"
  handler          = "lambda_function.lambda_handler"
  filename         = "lambda_function.zip"
  source_code_hash = filebase64sha256("lambda_function.zip")
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "myhome-tools-api"
  protocol_type = "HTTP"
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api_function.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "lambda_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}