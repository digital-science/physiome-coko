const winston = require('winston');
const CloudWatchLogger = require('./loggerCustomTransporter');

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            timestamp: true,
            colorize: true
        })
    ]
});

logger.level = process.env.LOG_LEVEL || 'silly';

if (
    !!process.env.CLOUDWATCH_GROUP_NAME &&
    !!process.env.CLOUDWATCH_STREAM_NAME
) {
    const logConfig = {
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
        logStreamName: process.env.CLOUDWATCH_STREAM_NAME,
        awsConfig: {
            accessKeyId: process.env.CLOUDWATCH_ACCESS_KEY_ID,
            secretAccessKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
            region: process.env.CLOUDWATCH_REGION
        }
    };

    const awsLogger = new CloudWatchLogger(logConfig);
    logger.on('logging', (transport, level, msg, meta) => {
        awsLogger.log({ level, msg, meta });
    });
}

logger.stream = {
    write(message, encoding) {
        logger.info(message);
    }
};

module.exports = logger;
