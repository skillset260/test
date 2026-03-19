const Joi = require("joi");
const httpStatus = require("http-status");
const pick = require("../../../utilities/pick");
const ApiError = require("../../../utilities/apiErrorUtils");

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    let errorMsg = [];
    const errorMessage = error.details.map((details) => {
      errorMsg.push(details.message.replace(/"/g, `'`));
      details.message;
    });

    return res.status(httpStatus.BAD_REQUEST).send({
      message: errorMsg.toString(),
      status: false,
      data: null,
      code: "INVALID_DATA",
      issue: "INVALID_DATA",
    });
    // return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
