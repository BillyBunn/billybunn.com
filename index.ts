#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

class WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}

const app = new cdk.App();
new WebsiteStack(app, 'WebsiteStack');
