import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

class WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * S3 bucket with website contents
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3.Bucket.html
     * autoDeleteObjects and removalPolicy set so entire bucket and contents are removed on stack deletion
     */
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      autoDeleteObjects: true,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
    });

    /**
     * S3 bucket deployment
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3-deployment.BucketDeployment.html
     * Specifies source folder for bucket files
     */
    new s3Deployment.BucketDeployment(this, "WebsiteBucketDeployment", {
      destinationBucket: websiteBucket,
      sources: [s3Deployment.Source.asset("./website-content")],
    });

    /**
     * CloudFront distribution of website bucket
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cloudfront.Distribution.html
     */
    new cloudfront.Distribution(this, 'WebsiteBucketDistribution', {
      defaultBehavior: {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    })

  }
}

const app = new cdk.App();
new WebsiteStack(app, "WebsiteStack");
