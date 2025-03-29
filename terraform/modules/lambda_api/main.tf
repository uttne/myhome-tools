data "archive_file" "api_lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/dist/main/python"
  output_path = "${path.module}/generated/main.zip"
}

data "archive_file" "api_layer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/dist/layer/python"
  output_path = "${path.module}/generated/layer.zip"
}


resource "aws_lambda_layer_version" "my_layer" {
  layer_name          = "myhome-tools-layer"
  filename         = data.archive_file.api_layer_zip.output_path
  source_code_hash = data.archive_file.api_layer_zip.output_base64sha256
  compatible_runtimes = ["python3.13"]
  description         = "Layer for myhome-tools Python dependencies"
}

resource "aws_lambda_function" "api_function" {
  function_name    = "myhome-tools-function"
  role             = var.role_arn
  runtime          = "python3.13"
  handler          = "main.handler"
  filename         = data.archive_file.api_lambda_zip.output_path
  source_code_hash = data.archive_file.api_lambda_zip.output_base64sha256
  layers           = [aws_lambda_layer_version.my_layer.arn]
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