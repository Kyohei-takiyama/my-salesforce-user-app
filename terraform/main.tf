# account id を取得
data "aws_caller_identity" "current" {}

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

module "oicd-iam-role" {
  source               = "./modules/iam-role"
  region               = var.region
  env_prefix           = var.env_prefix
  service_name         = var.service_name
  account_id           = data.aws_caller_identity.current.account_id
  lambda_function_name = module.lambda.lambda_function_name
  ecr_repository_name  = module.lambda.ecr_repository_name
  github_owner         = var.github_owner
  github_repo          = var.github_repo
  github_oidc_endpoint = var.github_oidc_endpoint
}

module "seacret-manager" {
  source       = "./modules/seacret-manager"
  service_name = var.service_name
  env_prefix   = var.env_prefix
  my_secrets   = var.my_secrets
}
