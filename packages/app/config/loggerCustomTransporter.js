const CloudWatchClient = require('winston-aws-cloudwatch/lib/cloudwatch-client')
const LogItem = require('winston-aws-cloudwatch/lib/log-item')
const Relay = require('winston-aws-cloudwatch/lib/relay')

class CloudWatchTransport {
  constructor(logConfig) {
    const client = new CloudWatchClient(
      logConfig.logGroupName,
      logConfig.logStreamName,
      logConfig,
    )
    this._relay = new Relay(client, logConfig)
    this._relay.start()
  }

  log({ level, msg, meta }) {
    this._relay.submit(new LogItem(+new Date(), level, msg, meta, () => ({})))
  }
}

module.exports = CloudWatchTransport
