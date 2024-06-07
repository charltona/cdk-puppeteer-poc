import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as path from "path";
import { CfnOutput, Duration } from "aws-cdk-lib";

export class CampaignTilePocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const chromiumLayer = new lambda.LayerVersion(this, 'ChromiumLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-layer')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Chromium lambda layer',
    })

    const pupetteerFunction = new nodejs.NodejsFunction(this, 'Puppet', {
      entry: path.join(__dirname, "../src/handler.ts"),
      handler: "handler",
      bundling: {
        externalModules:[
          "aws-sdk",
          "@aws-sdk/*"
        ]
      },
      runtime: lambda.Runtime.NODEJS_18_X,
      layers: [chromiumLayer],
      timeout: Duration.minutes(2),
      memorySize: 512,
    })

    const fnUrl = pupetteerFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    })

    new CfnOutput(this, 'FnUrl', {
      value: fnUrl.url
    })
  }
}
