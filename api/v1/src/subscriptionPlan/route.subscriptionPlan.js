const router = require("express").Router();
const subscriptionPlanController = require("./controller.subscriptionPlan");
const validate = require("../../middleware/validate");
const subscriptionPlanValidation = require("./validation.subscriptionPlan");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(subscriptionPlanValidation.getAllFilter),
  subscriptionPlanController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(subscriptionPlanValidation.create),
  subscriptionPlanController.add
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(subscriptionPlanValidation.get),
  subscriptionPlanController.get
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(subscriptionPlanValidation.getById),
  subscriptionPlanController.getById
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(subscriptionPlanValidation.update),
  subscriptionPlanController.update
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(subscriptionPlanValidation.changeStatus),
  subscriptionPlanController.statusChange
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(subscriptionPlanValidation.deleteDocument),
  subscriptionPlanController.deleteDocument
);

module.exports = router;
