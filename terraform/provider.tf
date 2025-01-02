terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.52"
    }
  }
  backend "s3" {
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.region
}
