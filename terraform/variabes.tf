variable "region" {
}

variable "env_prefix" {
  default = "dev"
}

variable "service_name" {
  default = "create-sf-app"
}

variable "github_token" {
}

variable "repository_url" {
}

variable "github_owner" {
}

variable "github_repo" {
}

variable "github_oidc_endpoint" {
}

variable "my_secrets" {
  type = map(string)
}
