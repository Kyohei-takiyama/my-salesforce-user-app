data "aws_iam_policy_document" "oidc-policy-document" {
  # for all resources
  statement {
    actions = [
      # ecr:GetAuthorizationTokenは全てのresourceに対して許可する必要がある
      "ecr:GetAuthorizationToken",
      "lambda:GetFunctionConfiguration",
    ]
    resources = ["*"]
  }

  # for update lambda
  statement {
    actions = [
      "lambda:UpdateFunctionCode",
    ]
    resources = [
      "arn:aws:lambda:${var.region}:${var.account_id}:function:${var.lambda_function_name}",
    ]
  }

  # for ecr
  statement {
    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:UploadLayerPart",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:InitiateLayerUpload",
      "ecr:BatchCheckLayerAvailability"
    ]
    resources = [
      "arn:aws:ecr:${var.region}:${var.account_id}:repository/${var.ecr_repository_name}",
    ]
  }
}

module "oicd-iam-policy" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"
  name   = "oidc-policy-${var.github_owner}-${var.github_repo}"
  path   = "/"
  policy = data.aws_iam_policy_document.oidc-policy-document.json
}

# https://docs.github.com/ja/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#adding-permissions-settings
# https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/latest/submodules/iam-assumable-role-with-oidc
module "oidc-iam-role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "5.30.0"

  create_role  = true
  role_name    = "oidc-role-${var.github_owner}-${var.github_repo}"
  provider_url = var.github_oidc_endpoint
  oidc_subjects_with_wildcards = [
    "repo:${var.github_owner}/${var.github_repo}:*",
  ]

  role_policy_arns = [
    module.oicd-iam-policy.arn
  ]
}
