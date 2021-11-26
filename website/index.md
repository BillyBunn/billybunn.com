---
layout: default.html
---

# The start of something great.

Starting out is the hardest part.

I built my website's infrastructure with AWS CDK. Its contents are in a S3 bucket, which is distributed by CloudFront. My domain is hosted and managed in AWS Route53, where there are DNS rules pointing billybunn.io at the CloudFront distribution. There's also another CloudFront distribution and S3 bucket that redirect www.billybunn.io to (non-www) billybunn.io.

I used 11ty, a static site generator, to make the web pages stored in the aforementioned S3 bucket.

I can't wait to get the source code up on GitHub and make more web magic happen.
