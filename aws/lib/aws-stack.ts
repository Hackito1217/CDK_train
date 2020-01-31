import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as iam from '@aws-cdk/aws-iam'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as s3n from '@aws-cdk/aws-s3-notifications'
import * as s3 from '@aws-cdk/aws-s3'
import * as events from '@aws-cdk/aws-events'
import * as eventsTargets from '@aws-cdk/aws-events-targets'

export class AwsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // lambdaを作ろう
    const myfunction = new lambda.Function(this, 'my-function', {
      functionName: 'my-function',
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'app.handler',
      code: lambda.Code.fromAsset('../lambda/sample1')
    })

    // dynamodbによる関数周りの設定
    const ddbFunction = new lambda.Function(this, 'ddb-function', {
      functionName: 'ddb-function',
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'app.handler',
      code: lambda.Code.fromAsset('../lambda/ddbFunction'),
      environment: {
        TABLE_NAME: "sam-samples",
        ENV: "nonono"
      }
    })

    // apigatewayから接続する関数
    const apiFunction = new lambda.Function(this, 'api-function', {
      functionName: 'api-function',
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'app.handler',
      code: lambda.Code.fromAsset('../lambda/apiFunction')
    })

    // s3から通知を受け取って動く関数
    const s3Function = new lambda.Function(this, "s3-function", {
      functionName: "s3-function",
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'app.handler',
      code: lambda.Code.fromAsset('../lambda/s3Function'),
      environment: {
        ENV: "nonono"
      }
    })

    // DDBからgetItemするための権限付与
    const tableName = 'sasasam-testee'

    // DDBのテーブル作成
    const table = new dynamodb.Table(this, 'sasasam-testee', {
      tableName: tableName,
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING}
    })
    table.grantReadWriteData(ddbFunction)

    // APIGateway
    const api = new apigateway.RestApi(this, "api", {
      restApiName: 'lambda-sample'
    });
    const integration = new apigateway.LambdaIntegration(apiFunction);
    api.root.addMethod('GET', integration);

    // s3に関する設定
    const myBucket = new s3.Bucket(this, "lambda-minden-a", {
      bucketName: "lambda-minden-a"
    })
    myBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(s3Function),
      {prefix: 'input/*'}
    )

    // 定期的な発火
    new events.Rule(this, 'ScheduleEvent', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [new eventsTargets.LambdaFunction(myfunction)]
    })
  }
}
