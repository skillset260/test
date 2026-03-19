const dotenv = require("dotenv");
const Joi = require("joi");
dotenv.config();

let {
  PROJECT_NAME,
  NODE_ENV,
  PORT,
  MONGODB_URL,
  JWT_SECRET_ACCESS,
  JWT_SECRET_REFRESH,
  JWT_EXPIRATION_ACCESS,
  JWT_EXPIRATION_OTP_VERIFY,
  JWT_SECRET_OTP_VERIFY,
  JWT_EXPIRATION_REFRESH,
  GOOGLE_API_KEYS,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  RABBITMQ_URL,
} = process.env;

let envObj = {
  PROJECT_NAME,
  NODE_ENV,
  PORT,
  MONGODB_URL,
  JWT_SECRET_ACCESS,
  JWT_SECRET_REFRESH,
  JWT_EXPIRATION_ACCESS,
  JWT_EXPIRATION_REFRESH,
  JWT_EXPIRATION_OTP_VERIFY,
  JWT_SECRET_OTP_VERIFY,
  GOOGLE_API_KEYS,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  RABBITMQ_URL,
};
const envVarsSchema = Joi.object().keys({
  PROJECT_NAME: Joi.string().default("clinic").required(),
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(3009),
  MONGODB_URL: Joi.string().required().label("Mongo DB url"),
  JWT_SECRET_ACCESS: Joi.string().required().label("JWT secret key"),
  JWT_SECRET_REFRESH: Joi.string().required().label("JWT secret refresh key"),
  JWT_SECRET_OTP_VERIFY: Joi.string()
    .required()
    .label("JWT secret otp verify key"),
  JWT_EXPIRATION_ACCESS: Joi.string()
    .default("74 hours")
    .description("after which token expires"),
  JWT_EXPIRATION_REFRESH: Joi.string()
    .default("1y")
    .description("after which token expires"),
  JWT_EXPIRATION_OTP_VERIFY: Joi.string()
    .default("1y")
    .description("after which otp token expires"),
  GOOGLE_API_KEYS: Joi.string().description("google map api keys"),
  RAZORPAY_KEY_ID: Joi.string().description("razorpay key id"),
  RAZORPAY_KEY_SECRET: Joi.string().description("razorpay key secret"),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().description("razorpay webhook secret"),
  RABBITMQ_URL: Joi.string()
    .default("amqp://localhost")
    .description("rabbit mq url"),
});

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(envObj);

if (error) {
  // logger.info(error)
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    },
  },
  project: envVars.PROJECT_NAME,
  jwt_secret_access: envVars.JWT_SECRET_ACCESS,
  jwt_secret_otp_verify: envVars.JWT_SECRET_OTP_VERIFY,
  jwt_secret_refresh: envVars.JWT_SECRET_REFRESH,
  jwt_expires_access: envVars.JWT_EXPIRATION_ACCESS,
  jwt_expires_refresh: envVars.JWT_EXPIRATION_REFRESH,
  jwt_expires_otp_verify: envVars.JWT_EXPIRATION_OTP_VERIFY,
  google_api_keys: envVars.GOOGLE_API_KEYS,
  razorpay_key_id: envVars.RAZORPAY_KEY_ID,
  razorpay_key_secret: envVars.RAZORPAY_KEY_SECRET,
  razorpay_webhook_secret: envVars.RAZORPAY_WEBHOOK_SECRET,
  rabbitmqUrl: envVars.RABBITMQ_URL,
};
