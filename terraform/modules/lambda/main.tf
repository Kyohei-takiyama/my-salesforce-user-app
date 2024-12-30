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

# ローカルにあるlambdaのソースコード
data "archive_file" "lambda_data" {
  type        = "zip"
  source_file = "${path.module}/src/dist/index.js"
  output_path = "${path.module}/src/index.zip"
}

# AWSへ作るlambda function
resource "aws_lambda_function" "lambda" {
  depends_on       = [aws_iam_role.lambda_role]
  function_name    = "${var.env_prefix}-${var.service_name}-lambda"
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  role             = aws_iam_role.lambda_role.arn
  filename         = data.archive_file.lambda_data.output_path
  source_code_hash = data.archive_file.lambda_data.output_base64sha256
}