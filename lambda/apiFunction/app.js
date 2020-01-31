exports.handler = async (event, context, callback) => {
  return JSON.stringify({
    statusCode: 200,
    bodsy: "Good Morning"
  })
}