# lambda

module "lambda" {
  source       = "./modules/lambda"
  service_name = var.service_name
  env_prefix   = var.env_prefix
}