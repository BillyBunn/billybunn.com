const path = require("path");

import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as certificateManager from "@aws-cdk/aws-certificatemanager";
import * as lambda from "@aws-cdk/aws-lambda";

class WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Variables set in untracked file cdk.context.json.
     * https://docs.aws.amazon.com/cdk/latest/guide/get_context_var.html
     */
    const DOMAIN_NAME = this.node.tryGetContext("DOMAIN_NAME");

    /**
     * S3 bucket with website contents.
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3.Bucket.html
     * autoDeleteObjects and removalPolicy set so entire bucket and contents are removed on stack deletion.
     * Static web hosting is not enabled here with websiteIndexDocument to hide the bucket's (non-CloudFront) endpoint.
     * Without a websiteIndexDocument, the bucket is configured as a S3 origin, not an HTTP origin,
     * meaning an OAI and bucket policy will be created for the CloudFront distribution
     * https://github.com/aws/aws-cdk/issues/14019
     */
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      autoDeleteObjects: true,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * Hosted zone in Route53.
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-route53.PublicHostedZone.html
     * Validates SSL certificate.
     * Holds DNS records that point to CloudFront distribution.
     */
    const websiteHostedZone = new route53.PublicHostedZone(this, "WebsiteHostedZone", {
      zoneName: DOMAIN_NAME,
    });

    /**
     * SSL certificate created by AWS Certificate Manager.
     * Validates certificate for website domain via DNS passing in the Route53 hosted zone.
     */
    const websiteCertificate = new certificateManager.DnsValidatedCertificate(this, "WebsiteCertificate", {
      domainName: DOMAIN_NAME,
      hostedZone: websiteHostedZone,
      region: "us-east-1", // must be in us-east-1 for CloudFront SSL
      subjectAlternativeNames: [`www.${DOMAIN_NAME}`],
      validation: certificateManager.CertificateValidation.fromDns(websiteHostedZone),
    });

    /**
     * Lambda@Edge to serve index.html file for simple URLS
     * e.g., 'domain.com/about/' instead of 'domain.com/about/index.html'
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cloudfront.experimental.EdgeFunction.html
     * https://aws.amazon.com/blogs/compute/implementing-default-directory-indexes-in-amazon-s3-backed-amazon-cloudfront-origins-using-lambdaedge/
     */
    const websiteEdgeLambda = new cloudfront.experimental.EdgeFunction(this, "WebsiteEdgeLambda", {
      // @ts-ignore
      code: lambda.Code.fromAsset("cf-edge-lambda"),
      handler: "index.handler",
      // @ts-ignore
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    /**
     * CloudFront distribution of website bucket.
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cloudfront.Distribution.html
     * PRICE_CLASS_100: USA, Canada, Europe, & Israel.
     * https://aws.amazon.com/cloudfront/pricing/
     * Note: stacks which use EdgeFunctions must have an explicitly set region
     */
    const websiteBucketDistribution = new cloudfront.Distribution(this, "WebsiteBucketDistribution", {
      certificate: websiteCertificate,
      defaultBehavior: {
        edgeLambdas: [
          {
            functionVersion: websiteEdgeLambda.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
          },
        ],
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      domainNames: [DOMAIN_NAME],
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: "/404/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404/index.html",
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    /**
     * S3 bucket deployment.
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3-deployment.BucketDeployment.html
     * Specifies source folder for bucket files.
     * Specifies which paths to invalidate in CloudFront edge caches.
     */
    new s3Deployment.BucketDeployment(this, "WebsiteBucketDeployment", {
      destinationBucket: websiteBucket,
      distribution: websiteBucketDistribution,
      distributionPaths: ["/*"],
      sources: [s3Deployment.Source.asset("./website/_site")],
    });

    /**
     * Route53 A record.
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-route53.ARecord.html
     * Points to CloudFront distribution
     */
    new route53.ARecord(this, "WebsiteARecord", {
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(websiteBucketDistribution)),
      zone: websiteHostedZone,
    });

    /**
     * Route53 AAAA record (for IPV6 addresses).
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-route53.AaaaRecord.html
     */
    new route53.AaaaRecord(this, "WebsiteAAAARecord", {
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(websiteBucketDistribution)),
      zone: websiteHostedZone,
    });

    /**
     * Redirect www subdomain to root (non-www) domain
     * https://aws.amazon.com/premiumsupport/knowledge-center/route-53-redirect-to-another-domain/
     * S3 bucket set to redirect, distributed by CloudFront, A records added to Route53 hosted zone
     */
    const websiteRedirectBucket = new s3.Bucket(this, "WebsiteRedirectBucket", {
      websiteRedirect: { hostName: DOMAIN_NAME, protocol: s3.RedirectProtocol.HTTPS },
    });

    const websiteRedirectDistribution = new cloudfront.Distribution(this, "WebsiteRedirectDistribution", {
      certificate: websiteCertificate,
      defaultBehavior: {
        origin: new origins.S3Origin(websiteRedirectBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [`www.${DOMAIN_NAME}`],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    new route53.ARecord(this, "WebsiteARecord-www", {
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(websiteRedirectDistribution)),
      recordName: "www",
      zone: websiteHostedZone,
    });

    new route53.AaaaRecord(this, "WebsiteAAAARecord-www", {
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(websiteRedirectDistribution)),
      recordName: "www",
      zone: websiteHostedZone,
    });
  }
}

const app = new cdk.App();
new WebsiteStack(app, "WebsiteStack", {
  env: {
    // Stacks which use EdgeFunctions must have an explicitly set region
    region: app.node.tryGetContext("REGION") || "us-west-2",
  },
});
