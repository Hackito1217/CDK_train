exports.handler = async (event, context, callback) => {
  console.log(JSON.stringify(event))
  const response = {
    statusCode: 200,
    body: "hello world"
  }
  console.log(response)
  return response
}