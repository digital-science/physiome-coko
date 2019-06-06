const AWS = require('aws-sdk')
const config = require('config')

module.exports = {
  transport: {
    SES: new AWS.SES({
      accessKeyId: config.SES.accessKey,
      secretAccessKey: config.SES.secretKey,
      region: config.SES.region,
    }),
  },
}
