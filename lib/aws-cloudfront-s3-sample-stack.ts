import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';

import { aws_s3, aws_cloudfront, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AwsCloudfrontS3SampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const accountId = cdk.Stack.of(this).account;
    const region = cdk.Stack.of(this).region;

    const bucket = new aws_s3.Bucket(this, `bucket`, {
      bucketName: `bucket20240820-${region}-${accountId}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(30 * 3),
        },
      ],
    });

    const cloudFrontToS3 = new CloudFrontToS3(
      this,
      'solution-constructs-cloudfront-s3',
      {
        existingBucketObj: bucket,
        cloudFrontDistributionProps: {
          defaultBehavior: {
            caches: [aws_cloudfront.CachePolicy.CACHING_OPTIMIZED],
            allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
            viewerProtocolPolicy:
              aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
        },
      },
    );

    // バケットポリシーの作成
    const bucketPolicy = new aws_iam.PolicyStatement({
      effect: aws_iam.Effect.ALLOW,
      principals: [new aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:ListBucket'],
      resources: [bucket.bucketArn],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${
            cdk.Stack.of(this).account
          }:distribution/${
            cloudFrontToS3.cloudFrontWebDistribution.distributionId
          }`,
        },
      },
    });

    bucket.addToResourcePolicy(bucketPolicy);
  }
}
