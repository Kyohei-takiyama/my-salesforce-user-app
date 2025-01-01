output "lambda_invoke_arn" {
  value = aws_lambda_function.lambda.invoke_arn
}

output "lambda_function_name" {
  value = aws_lambda_function.lambda.function_name
}


output "ecr_repository_name" {
  value = aws_ecr_repository.ecr.name
}
