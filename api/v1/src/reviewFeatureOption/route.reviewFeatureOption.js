const router = require("express").Router();
const reviewFeatureOptionController = require("./controller.reviewFeatureOption");
const validate = require("../../middleware/validate");
const reviewFeatureOptionValidation = require("./validation.reviewFeatureOption");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(reviewFeatureOptionValidation.getAllFilter),
  reviewFeatureOptionController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(reviewFeatureOptionValidation.create),
  reviewFeatureOptionController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(reviewFeatureOptionValidation.get),
  reviewFeatureOptionController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(reviewFeatureOptionValidation.getById),
  reviewFeatureOptionController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(reviewFeatureOptionValidation.update),
  reviewFeatureOptionController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(reviewFeatureOptionValidation.changeStatus),
  reviewFeatureOptionController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(reviewFeatureOptionValidation.deleteDocument),
  reviewFeatureOptionController.deleteDocument,
);

module.exports = router;
