import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";

class WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * S3 bucket with website contents
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3.Bucket.html
     * autoDeleteObjects and removalPolicy set so entire bucket and contents are removed on stack deletion
     * static web hosting is not enabled here with websiteIndexDocument to hide the bucket's (non-CloudFront) endpoint
     * Without a websiteIndexDocument, the bucket is configured as a S3 origin, not an HTTP origin
     * meaning an OAI and bucket policy will be created for the CloudFront distribution
     * https://github.com/aws/aws-cdk/issues/14019
     */
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      autoDeleteObjects: true,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    
    /**
     * CloudFront distribution of website bucket
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cloudfront.Distribution.html
     * PRICE_CLASS_100: USA, Canada, Europe, & Israel
     * https://aws.amazon.com/cloudfront/pricing/
     */
    const websiteBucketDistribution = new cloudfront.Distribution(this, "WebsiteBucketDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100
    });

    /**
     * S3 bucket deployment
     * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-s3-deployment.BucketDeployment.html
     * Specifies source folder for bucket files
     */
    new s3Deployment.BucketDeployment(this, "WebsiteBucketDeployment", {
      destinationBucket: websiteBucket,
      distribution: websiteBucketDistribution,
      distributionPaths: ['/*'],
      sources: [s3Deployment.Source.asset("./website-content")],
    });
  }
}

const app = new cdk.App();
new WebsiteStack(app, "WebsiteStack");
