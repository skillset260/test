const router = require("express").Router();
const profileController = require("./controller.profile");
const validate = require("../../middleware/validate");
const profileValidation = require("./validation.profile");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(profileValidation.getAllFilter),
  profileController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(profileValidation.create),
  profileController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(profileValidation.get),
  profileController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(profileValidation.getById),
  profileController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(profileValidation.update),
  profileController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(profileValidation.changeStatus),
  profileController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(profileValidation.deleteDocument),
  profileController.deleteDocument,
);

module.exports = router;
