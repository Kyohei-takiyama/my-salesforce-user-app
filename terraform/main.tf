# lambda
module "lambda" {
  source       = "./modules/lambda"
  service_name = var.service_name
  env_prefix   = var.env_prefix
}

# api-gateway
module "api-gateway" {
  source            = "./modules/api-gateway"
  service_name      = var.service_name
  env_prefix        = var.env_prefix
  lambda_invoke_arn = module.lambda.lambda_invoke_arn
}

module "amplify" {
  source           = "./modules/amplify"
  service_name     = var.service_name
  env_prefix       = var.env_prefix
  amplify_app_name = var.service_name
  repository_url   = var.repository_url
  github_token     = var.github_token
  branch_name      = "main"
}