const logger = require("@pubsweet/logger");


module.exports = (prefix) => {

    const p = `[${prefix.trim()}] `;

    return {
        error: (...args) => logger.error(p, ...args),
        warn: (...args) => logger.warn(p, ...args),
        info: (...args) => logger.info(p, ...args),
        debug: (...args) => logger.debug(p, ...args)
    };
};