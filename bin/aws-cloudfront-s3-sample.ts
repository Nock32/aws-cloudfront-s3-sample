#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCloudfrontS3SampleStack } from '../lib/aws-cloudfront-s3-sample-stack';

const app = new cdk.App();
new AwsCloudfrontS3SampleStack(app, 'AwsCloudfrontS3SampleStack', {});
