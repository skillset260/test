const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/commonValidation");
const { discountTypeEnum, paymentMethod } = require("../../../utils/enumUtils");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    customerId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null)
      .optional(),
    subscriptionPlanId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    planStartDate: Joi.string().custom(commonValidation.dateFormat).required(),
    discountType: Joi.string()
      .valid(...Object.values(discountTypeEnum))
      .required(),
    discountValue: Joi.string().required(),
    receivedAmt: Joi.number().required(),
    dueDate: Joi.string()
      .custom(commonValidation.dateFormat)
      .allow("")
      .optional(),
    paymentMode: Joi.string()
      .valid(...Object.values(paymentMethod))
      .required(),
  }),
};

/**
 * renew subscription
 */
const renewSubscription = {
  body: Joi.object().keys({
    planStartDate: Joi.string().custom(commonValidation.dateFormat).required(),
    discountType: Joi.string()
      .valid(...Object.values(discountTypeEnum))
      .required(),
    discountValue: Joi.string().required(),
    receivedAmt: Joi.number().required(),
    dueAmt: Joi.number().required().allow(0).optional(),
    dueDate: Joi.string()
      .custom(commonValidation.dateFormat)
      .allow("")
      .optional(),
    paymentMode: Joi.string()
      .valid(...Object.values(paymentMethod))
      .required(),
  }),
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * upgrade subscription
 */
const upgradeSubscriptionPlan = {
  body: Joi.object().keys({
    newPlanId: Joi.string().custom(commonValidation.objectId).required(),
    planStartDate: Joi.string()
      .required()
      .custom(commonValidation.sameOrAfterToday),
    discountType: Joi.string()
      .valid(...Object.values(discountTypeEnum))
      .required(),
    discountValue: Joi.string().required(),
    paymentMode: Joi.string()
      .valid(...Object.values(paymentMethod))
      .required(),
    receivedAmt: Joi.number().min(0).required(),
    dueDate: Joi.string()
      .custom(commonValidation.dateFormat)
      .allow("")
      .optional()
      .custom(commonValidation.sameOrAfterToday),
  }),
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * update existing document
 */
const update = {
  body: Joi.object().keys({
    planStartDate: Joi.string().custom(commonValidation.dateFormat).required(),
    discountType: Joi.string()
      .valid(...Object.values(discountTypeEnum))
      .required(),
    discountValue: Joi.string().required(),
    receivedAmt: Joi.number().required(),
    dueAmt: Joi.number().required().allow(0).optional(),
    dueDate: Joi.string()
      .custom(commonValidation.dateFormat)
      .allow("")
      .optional(),
  }),
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * update payment in existing document
 */
const updatePayment = {
  body: Joi.object().keys({
    dueAmt: Joi.number().allow(0),
    receivedAmt: Joi.number().required(),
    remark: Joi.string().allow("").optional(),
    dueDate: Joi.string().allow("").optional(),
  }),
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * filter and pagination api
 */
const getAllFilter = {
  body: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    rangeFilterBy: Joi.object()
      .keys({
        rangeFilterKey: Joi.string().allow(""),
        rangeInitial: Joi.string().allow(""),
        rangeEnd: Joi.string().allow(""),
      })
      .default({})
      .optional(),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    filterBy: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().allow(""),
        value: Joi.alternatives().try(
          Joi.string().allow(""),
          Joi.number().allow(""),
          Joi.boolean().allow(""),
          Joi.array().items(Joi.string()).default([]),
          Joi.array().items(Joi.number()).default([]),
          Joi.array().items(Joi.boolean()).default([]),
          Joi.array().default([]),
        ),
      }),
    ),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};

/**
 * get either all data or single document
 */
const get = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      bookName: Joi.string().optional(),
    })
    .optional(),
};

/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * change status of document
 */
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * exports
 */
module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  getById,
  updatePayment,
  renewSubscription,
  upgradeSubscriptionPlan,
};
