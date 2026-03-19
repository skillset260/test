const router = require("express").Router();
const seoKeywordController = require("./controller.seoKeyword");
const validate = require("../../middleware/validate");
const seoKeywordValidation = require("./validation.seoKeyword");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(seoKeywordValidation.getAllFilter),
  seoKeywordController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(seoKeywordValidation.create),
  seoKeywordController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(seoKeywordValidation.get),
  seoKeywordController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(seoKeywordValidation.getById),
  seoKeywordController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(seoKeywordValidation.update),
  seoKeywordController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(seoKeywordValidation.changeStatus),
  seoKeywordController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(seoKeywordValidation.deleteDocument),
  seoKeywordController.deleteDocument,
);

module.exports = router;
