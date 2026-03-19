const express = require("express");
const app = express();
const helmet = require("helmet");
var cors = require("cors");
require("express-async-errors");
const httpStatus = require("http-status");
const morgan = require("./config/morgan");
const config = require("./config/config");
const logger = require("./config/logger");
const routes = require("./api/v1/Route");
const { errorConverter, errorHandler } = require("./middleware/error");

/**
 * database connection estabilished
 */
require("./database/mongo");
require("./database/redis");

//----------------------

//---------
/**
 * to avoid cors error
 */
app.use(cors());
//----------------------

/**
 *
 *for security
 *
 */
app.use(helmet());
//----------------------

// app.use(morgan("dev"));
if (config.mode !== "development") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/public", express.static(__dirname + "/public"));

app.use(`/v1`, routes);

// send back a 404 error for any unknown api request
app.use((req, res) => {
  logger.info(
    "Invalid url requested. It may be because of versioning. Please check.",
  );
  return res.status(httpStatus.NOT_FOUND).send({
    message: "Page Not found",
    status: false,
    code: "PAGE_NOT_FOUND",
    issue: "INVALID_REQUEST_ROUTE",
    data: null,
  });
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
