const router = require("express").Router();
const categoryController = require("./controller.category");
const validate = require("../../middleware/validate");
const categoryValidation = require("./validation.category");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(categoryValidation.getAllFilter),
  categoryController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(categoryValidation.create),
  categoryController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(categoryValidation.get),
  categoryController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(categoryValidation.getById),
  categoryController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(categoryValidation.update),
  categoryController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(categoryValidation.changeStatus),
  categoryController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(categoryValidation.deleteDocument),
  categoryController.deleteDocument,
);

module.exports = router;
