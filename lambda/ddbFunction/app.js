const AWS = require('aws-sdk')
const local = (process.env.ENV === "local")
const config = (local ? {
  region: 'ap-northeast-1',
  accessKeyId: 'fakeAccessKeyId',
  secretAccessKey: 'fakeSecretAccessKey'
} : {})
AWS.config.update(config)

const ddbConfig = {
  endpoint: (local ? "http://dynamodb:8000" : undefined)
}
const ddb = new AWS.DynamoDB.DocumentClient(ddbConfig)

const tableName = process.env.TABLE_NAME

exports.handler = async (event, context, callback) => {
  console.log(JSON.stringify(event))
  const id = '001'

  const data = await ddb.get({TableName: tableName, Key: {id: id}}).promise()

  return {
    statusCode: 200,
    body: data.Item.message
  }
}