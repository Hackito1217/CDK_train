const AWS = require('aws-sdk')
const local = (process.env.ENV === "local")
const config = (local ? {
  region: 'ap-northeast-1',
  accessKeyId: 'fakeAccessKeyId',
  secretAccessKey: 'fakeSecretAccessKey'
} : {})
AWS.config.update(config)

const s3config = {
  endpoint: (local ? "http://localstack:4572" : undefined)
}
const s3 = new AWS.S3(s3config)

exports.handler = async (event, context, callback) => {
  console.log(JSON.stringify(event.Records[0].s3))
  return {
    statusCode: 200,
    body: JSON.stringify(event.Records[0].s3.object.key)
  }
} 