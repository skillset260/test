const router = require("express").Router();
const subCategoryController = require("./controller.subcategory");
const validate = require("../../middleware/validate");
const subCategoryValidation = require("./validation.subcategory");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(subCategoryValidation.getAllFilter),
  subCategoryController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(subCategoryValidation.create),
  subCategoryController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(subCategoryValidation.get),
  subCategoryController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(subCategoryValidation.getById),
  subCategoryController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(subCategoryValidation.update),
  subCategoryController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(subCategoryValidation.changeStatus),
  subCategoryController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(subCategoryValidation.deleteDocument),
  subCategoryController.deleteDocument,
);

module.exports = router;
