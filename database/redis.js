const redis = require("redis");
const logger = require("../config/logger");

const redisClient = redis.createClient();
redisClient.connect();
redisClient.on("connect", function () {
  logger.info("Redis client connected");
});
redisClient.on("error", function (error) {
  logger.info("Redis Error Encountered: ", error);
});
//
module.exports = redisClient;
