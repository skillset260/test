const router = require("express").Router();
const reviewFeatureController = require("./controller.revieweFeature");
const validate = require("../../middleware/validate");
const reviewFeatureValidation = require("./validation.revieweFeature");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(reviewFeatureValidation.getAllFilter),
  reviewFeatureController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(reviewFeatureValidation.create),
  reviewFeatureController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(reviewFeatureValidation.get),
  reviewFeatureController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(reviewFeatureValidation.getById),
  reviewFeatureController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(reviewFeatureValidation.update),
  reviewFeatureController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(reviewFeatureValidation.changeStatus),
  reviewFeatureController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(reviewFeatureValidation.deleteDocument),
  reviewFeatureController.deleteDocument,
);

module.exports = router;
