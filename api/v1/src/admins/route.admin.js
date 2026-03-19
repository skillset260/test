const router = require("express").Router();
const adminController = require("./controller.admin");
const validate = require("../../middleware/validate");
const adminValidation = require("./validation.admin");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */
router.post(
  "/",
  authCheckMiddleware,
  validate(adminValidation.getAllFilter),
  adminController.allFilterPagination,
);

/**
 * list
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(adminValidation.get),
  adminController.get,
);

/**
 * create new document
 */
router.post("/signup", validate(adminValidation.create), adminController.add);

/**
 * login user via otp
 */
router.post(
  "/login",
  validate(adminValidation.loginValid),
  adminController.login,
);

/**
 * refresh
 */
router.post(
  "/refresh",
  // accessModuleCheck,
  validate(adminValidation.refreshTokenValid),
  adminController.refreshToken,
);

/**
 * change password
 */
router.put(
  "/change-password",
  authCheckMiddleware,
  validate(adminValidation.changePasswordValid),
  adminController.changePassword,
);

/**
 * change password
 */
router.put(
  "/reset-password/:id",
  authCheckMiddleware,
  validate(adminValidation.resetPasswordValid),
  adminController.resetPassword,
);

/**
 * update document
 */
router.put(
  "/update/:id",
  authCheckMiddleware,
  validate(adminValidation.update),
  adminController.update,
);

/**
 * profile update document
 */
router.put(
  "/profile-update",
  authCheckMiddleware,
  validate(adminValidation.updateProfile),
  adminController.updateProfile,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(adminValidation.changeStatus),
  adminController.statusChange,
);

/**
 * logout
 */
router.post("/logout", authCheckMiddleware, adminController.logout);

/**
 * get profile document
 */
router.get("/profile", authCheckMiddleware, adminController.getProfileById);

/**
 * get document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(adminValidation.getById),
  adminController.getById,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(adminValidation.deleteDocument),
  adminController.deleteDocument,
);

module.exports = router;
