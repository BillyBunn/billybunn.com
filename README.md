# Billy Bunn's personal website reboot

# 🚧 Currently under construction 🚧

## Goals

- At all costs, "infrastructure as code" (I'm going with [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/))
- Document and present what I learn in the process of building it
- A place for showcasing my work
- A place for writing learnings and musings



## Log

#### 2021-11-18
For reference, CDK example for a static site. Uses some of the deprecated methods 
https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/static-site/static-site.ts

Deployment issue: getting hung up on ACM certificate creation
Check domain name servers (route53 > registered domains > domain > "add or edit name servers")
See if they match the NS records being created by route53.PublicHostedZone
https://github.com/aws/aws-cdk/issues/2914

Had to deploy in pieces. First, just the hosted zone. 
Then manually updated name servers of the domain registered with Route53. 
Then deployed ACM cert, then the rest.

Another issue: CloudFront SSL cert must be in us-east-1 region. 
Solution was to move entire stack to us-east-1 in order to keep things in the same deployment
https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
NEVERMIND: used acm.DnsValidatedCertificate instead, because it allows a specified region.

#### 2021-11-19
Webpage up and running. Redirects and everything. 
                                `https://billybunn.io`
`http://billybunn.io`       ->  `https://billybunn.io`
`https://www.billybunn.io`  ->  `https://billybunn.io`
`http://www.billybunn.io`   ->  `https://billybunn.io`

     * Not using this
     * essentially, the same content will be served from www and non-www
     * does not redirect www -> non-www
     * a viable option (and probably cheaper than the alternative)
     * but for simplicity, I'm going to issue a 301 redirect with a cloudfront distribution
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Choosing_between_www_and_non-www_URLs
     */
    // new route53.CnameRecord(this, "WebsiteCNAMERecord-www", {
    //   domainName: DOMAIN_NAME,
    //   recordName: "www",
    //   zone: websiteHostedZone,
    // });

#### 2021-11-25
Using 11ty! Did some configuration, moved over old posts.

#### 2021-11-26
Added lambda@edge function for "default directory indexes" https://aws.amazon.com/blogs/compute/implementing-default-directory-indexes-in-amazon-s3-backed-amazon-cloudfront-origins-using-lambdaedge/

      // architecture: lambda.Architecture.ARM_64,
      // "Invalid request provided: Lambda@Edge does not support functions with an architecture of arm64


## Ideas
- up on GitHub
- connect to GitHub actions
- `/pricing` page where I track how much this whole thing is costing using the AWS API. With fun visualizations.
- `/creeping` page that displays the requester's IP and publically available information.
- `/uses` 
- `/resume` markdown public resume.
- posts about unraid learnings and NAS build
- posts about Plex
- posts about Usenet
- integration with medium?



# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
