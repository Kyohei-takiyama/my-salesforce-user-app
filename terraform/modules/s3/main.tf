resource "aws_s3_bucket" "this" {
  bucket = "${var.env_prefix}-${var.service_name}-bucket"

  force_destroy = true
}


