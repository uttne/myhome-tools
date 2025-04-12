

resource "aws_s3_bucket" "content_bucket" {
  bucket = var.bucket_name
  force_destroy = true
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_s3_bucket_ownership_controls" "content_bucket" {
  bucket = aws_s3_bucket.content_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "content_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.content_bucket]
  bucket     = aws_s3_bucket.content_bucket.id
  acl        = "private"
}

resource "aws_s3_bucket_policy" "content_bucket" {
  bucket = aws_s3_bucket.content_bucket.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess",
        Effect    = "Allow",
        Principal = {
          CanonicalUser = var.cloudfront_s3_canonical_user_id
        },
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.content_bucket.arn}/*"
      }
    ]
  })
}
