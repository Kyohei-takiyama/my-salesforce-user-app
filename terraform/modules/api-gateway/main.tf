################################
# API GatewayにアタッチするIAM Role
################################
resource "aws_iam_role" "api_gateway_role" {
  name               = "${var.service_name}-apigateway-role"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_assume_role.json
}

resource "aws_iam_role_policy_attachment" "api_gateway_policy_logs" {
  role       = aws_iam_role.api_gateway_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_iam_role_policy_attachment" "api_gateway_policy_lambda" {
  role       = aws_iam_role.api_gateway_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

data "aws_iam_policy_document" "api_gateway_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

################################
# API Gateway
################################

resource "aws_api_gateway_rest_api" "api" {
  name = "${var.service_name}-api"

  body = jsonencode({
    openapi = "3.0.1"
    info = {
      title   = "api"
      version = "1.0"
    }
    paths = {
      "/sample" = {
        get = {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST" # LambdaへのアクセスはPOSTでないといけないらしい
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = var.lambda_invoke_arn
            credentials          = aws_iam_role.api_gateway_role.arn
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  depends_on  = [aws_api_gateway_rest_api.api]
  stage_name  = var.env_prefix
  triggers = {
    # resource "aws_lambda_function" "api" の内容が変わるごとにデプロイされるようにする
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.api))
  }
}

data "aws_iam_policy_document" "api_gateway_policy" {
  statement {
    effect = "Allow"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions   = ["execute-api:Invoke"]
    resources = ["${aws_api_gateway_rest_api.api.execution_arn}/*"]
  }
}

resource "aws_api_gateway_rest_api_policy" "policy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  policy      = data.aws_iam_policy_document.api_gateway_policy.json
}