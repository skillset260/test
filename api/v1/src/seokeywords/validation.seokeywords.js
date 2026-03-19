const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/commonValidation");


const createReviewFeatureValidation = Joi.object({
  catId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Category is required",
    "any.required": "Category is required",
  }),
  subCatId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Sub-category is required",
    "any.required": "Sub-category is required",
  }),

  reviewFeatureName: Joi.string().trim().max(100).required().messages({
    "string.empty": "Feature name is required",
    "string.max":   "Feature name must not exceed 100 characters",
    "any.required": "Feature name is required",
  }), 
});

// ── Update ────────────────────────────────────────────────────
const updateReviewFeatureValidation = Joi.object({
  catId:    Joi.string().hex().length(24).optional(),
  subCatId: Joi.string().hex().length(24).optional(),
  reviewFeatureName: Joi.string().trim().max(100).optional().messages({
    "string.empty": "Feature name cannot be empty",
    "string.max":   "Feature name must not exceed 100 characters",
  }),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided for update",
});

const paginationValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(""),
  isActive: Joi.boolean().optional(),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(
    req.method === "GET" ? req.query : req.body,
    { abortEarly: false, stripUnknown: true }
  );

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, errors });
  }

  if (req.method === "GET") req.query = value;
  else req.body = value;

  next();
};

module.exports = {
  validateCreate: validate(createReviewFeatureValidation),
  validateUpdate: validate(updateReviewFeatureValidation),
  validatePagination: validate(paginationValidation),
  
};
