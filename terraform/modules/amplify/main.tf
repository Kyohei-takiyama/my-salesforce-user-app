#################################################
# Amplify App (Next.js用)
#################################################
resource "aws_amplify_app" "nextjs_app" {
  name         = var.amplify_app_name
  repository   = var.repository_url # 例: "https://github.com/your-org/your-repo"
  access_token = var.github_token   # GitHubのPersonal Access Token等 (GitLab等ならoauth_tokenなど別指定)
  platform     = "WEB_COMPUTE"
  build_spec   = file("${path.module}/../../../frontend/buildspec.yaml")

  enable_auto_branch_creation = true
  # The default patterns added by the Amplify Console.
  auto_branch_creation_patterns = [
    "*",
    "*/**",
  ]
  auto_branch_creation_config {
    # Enable auto build for the created branch.
    enable_auto_build = true
    framework         = "Next.js - SSR"
  }

  environment_variables = {
    AMPLIFY_DIFF_DEPLOY       = "false"
    AMPLIFY_MONOREPO_APP_ROOT = "frontend"
  }

  custom_rule {
    condition = null
    source    = "/<*>"
    status    = "404-200"
    target    = "/index.html"
  }

  # Basic Auth (カンタンなパスワード保護) やカスタムドメイン設定したい場合は追記可能
}

#################################################
# Amplify Branch
#################################################
resource "aws_amplify_branch" "main_branch" {
  app_id      = aws_amplify_app.nextjs_app.id
  branch_name = var.branch_name
  description = "Next.js main branch"
}

#################################################
# 出力 (URLの確認)
#################################################
output "amplify_app_default_domain" {
  description = "Amplify のデフォルトドメイン (例: xxxxxxxxx.amplifyapp.com)"
  value       = aws_amplify_app.nextjs_app.default_domain
}