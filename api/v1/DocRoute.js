const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { swaggerDefinition } = require("./docs/swaggerDef");
const router = express.Router();
const { version } = require("../../package.json");
const config = require("../../config/config");
const logger = require("../../config/logger");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: config.project,
      version,
      description: `API Library for ${config.project} project`,
      license: {
        name: "",
        url: "",
      },
    },
    servers: [
      {
        url: `${config.localhost}:${config.port}/v1`,
      },
    ],
    // host: `http://localhost:3004`,
    // basePath: '/v1/api-docs/',
  },
  apis: ["api/v1/docs/*.yml", `${__dirname}/*.js`],
};
//'../../docs/*.yml',

const specs = swaggerJsdoc(options);

router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

module.exports = router;
