provider "aws" {
  region = "ap-northeast-1"
}

module "s3" {
  source           = "./modules/s3"
  bucket_name      = "myhome-tools-bucket"
  spa_source_dir   = "${path.module}/../front/dist"
  # CloudFront OAI の ARN は後で CloudFront モジュールから出力される値を利用するか、
  # 初回は仮の値として渡して、apply 後に更新する方法もあります。
  cloudfront_oai_arn = module.cloudfront.oai_arn 
}

module "s3_contents" {
  source            = "./modules/s3_contents"
  bucket_name       = "myhome-tools-contents-bucket"
  cloudfront_oai_arn = module.cloudfront.oai_arn
}

module "cloudfront" {
  source                 = "./modules/cloudfront"
  s3_origin_domain       = module.s3.bucket_regional_domain_name
  s3_contents_origin_domain       = module.s3_contents.bucket_regional_domain_name
  # lambda_api モジュールで作成した API Gateway のエンドポイントを利用
  api_gateway_endpoint   = module.lambda_api.api_endpoint
  default_root_object    = "index.html"
  oai_comment            = "OAI for SPA S3 bucket"
  lambda_edge_function_version_arn = module.lambda_edge.lambda_edge_function_version_arn
}

module "iam" {
  source    = "./modules/iam"
  role_name = "myhome_tools_lambda_exec_role"
}

module "lambda_api" {
  source   = "./modules/lambda_api"
  role_arn = module.iam.lambda_exec_role_arn
}

module "cognito" {
  source             = "./modules/cognito"
  app_domain  = ""
}

module "lambda_edge" {
  source             = "./modules/lambda_edge"
  cognito_client_id  = module.cognito.client_id
  cognito_user_pool_id = module.cognito.user_pool_id
  lambda_edge_source = "${path.module}/../auth/dist/index.tpl.mjs"
  lambda_role_arn    = module.iam.lambda_exec_role_arn
}
