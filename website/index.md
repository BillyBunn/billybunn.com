---
layout: homepage.njk
---

## The [start](/posts/new-beginnings/) of something great.

This website is currently under construction. 🏗🔨🚧

It belongs to Billy Bunn, a web developer based in Seattle, WA.

You can [contact him here](/contact).

## About this website

This website's infrastructure uses [AWS CDK](https://aws.amazon.com/cdk/). Its contents are in a S3 bucket, which is distributed by CloudFront.

The domain is hosted and managed in AWS Route53, where there are DNS rules pointing billybunn.io at the CloudFront distribution. There's also another CloudFront distribution and S3 bucket that redirect www.billybunn.io to (non-www) billybunn.io.

It uses [11ty](https://www.11ty.dev/), a static site generator, to make the web pages stored in the aforementioned S3 bucket.

Check out the [changelog](/changelog/) for a list of updates.