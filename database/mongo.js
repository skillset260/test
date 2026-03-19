const mongoose = require("mongoose");
const mongoDBErros = require("mongoose-mongodb-errors");
const config = require("../config/config");
const logger = require("../config/logger");

// const { client } = require("./redis");

mongoose.Promise = Promise;
mongoose.plugin(mongoDBErros);
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(async (result) => {
    // await client();
    // TODO: check database connection, do not remove console logs in this file

    logger.info("Connected to database.... ");
  })
  .catch((err) => {
    logger.info("Could'nt connect with database.", err);
  });
