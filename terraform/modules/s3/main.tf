locals {
  spa_files = fileset(var.spa_source_dir, "**/*")
  mime_types = {
    html = "text/html"
    htm  = "text/html"
    css  = "text/css"
    js   = "application/javascript"
    json = "application/json"
    png  = "image/png"
    jpg  = "image/jpeg"
    jpeg = "image/jpeg"
    svg  = "image/svg+xml"
  }
}

resource "aws_s3_bucket" "spa_bucket" {
  bucket = var.bucket_name
  tags = {
    Project = "MYHOME_TOOLS"
  }
}

resource "aws_s3_bucket_ownership_controls" "spa_bucket" {
  bucket = aws_s3_bucket.spa_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "spa_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.spa_bucket]
  bucket     = aws_s3_bucket.spa_bucket.id
  acl        = "private"
}

resource "aws_s3_bucket_policy" "spa_bucket" {
  bucket = aws_s3_bucket.spa_bucket.id
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
        Resource  = "${aws_s3_bucket.spa_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_object" "spa_objects" {
  for_each = { for file in local.spa_files : file => file }
  bucket   = aws_s3_bucket.spa_bucket.id
  key      = each.value
  source   = "${var.spa_source_dir}/${each.value}"
  etag     = filemd5("${var.spa_source_dir}/${each.value}")

  content_type = try(
    lookup(
      local.mime_types,
      regex(".*[.]([^.]*)$", each.value)[0],
      "application/octet-stream"
    ),
    "application/octet-stream"
  )

  tags = {
    Project = "MYHOME_TOOLS"
  }
}