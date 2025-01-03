################################
# LambdaにアタッチするIAM Role
################################

resource "aws_iam_role" "lambda_role" {
  name               = "${var.service_name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# lambdaにアタッチするカスタムポリシー
data "aws_iam_policy_document" "lambda_policy" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = ["*"]
  }

  # s3にアクセスするためのポリシー
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.service_name}-lambda-policy"
  description = "Policy for lambda"
  policy      = data.aws_iam_policy_document.lambda_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_custom_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

data "aws_ecr_image" "image" {
  repository_name = aws_ecr_repository.ecr.name
  most_recent     = true
}

# AWSへ作るlambda function
resource "aws_lambda_function" "lambda" {
  depends_on    = [aws_iam_role.lambda_role, aws_ecr_repository.ecr, data.aws_ecr_image.image]
  function_name = "${var.env_prefix}-${var.service_name}-lambda"
  package_type  = "Image"
  image_uri     = data.aws_ecr_image.image.image_uri
  role          = aws_iam_role.lambda_role.arn
}

################################
# ECR
################################
resource "aws_ecr_repository" "ecr" {
  name = "${var.env_prefix}-${var.service_name}-ecr"
}
