const bunyan = require("bunyan");
const { name, version } = require("../../../package.json");

let _logger = {};

let streams = [];
streams.push(
  {
    level: "debug",
    stream: process.stdout,
  },
  {
    level: "info",
    path: process.env.LOGFILE,
  },
  {
    level: "error",
    path: process.env.LOGFILE,
  }
); //log to stdout

_logger.log = bunyan.createLogger({ name, version, streams: streams });

// child logs
_logger.getChildLogger = function (componentName) {
  return this.log.child({
    component: componentName,
  });
};

_logger.ipFrom = function (req) {
  return (
    req.params.ip ||
    req.headers["x-original-forwarded-for"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress
  );
};

module.exports = _logger;
