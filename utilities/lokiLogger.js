const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");

const options = {
  transports: [
    new LokiTransport({
      host: "http://192.168.1.24:3100",
    }),
  ],
};
const lokiLogger = createLogger(options);

module.exports = {
  lokiLogger,
};
