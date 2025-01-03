resource "aws_secretsmanager_secret" "this" {
  name        = "${var.env_prefix}-${var.service_name}-seacret"
  description = "This is a secret manager for ${var.service_name}"

  tags = {
    Name = "${var.env_prefix}-${var.service_name}-seacret"
  }
}


resource "aws_secretsmanager_secret_version" "this" {
  secret_id     = aws_secretsmanager_secret.this.id
  secret_string = jsonencode(var.my_secrets)
}
