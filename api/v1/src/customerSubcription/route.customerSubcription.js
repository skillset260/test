const router = require("express").Router();
const customerSubcriptionController = require("./controller.customerSubcription");
const validate = require("../../middleware/validate");
const customerSubcriptionValidation = require("./validation.customerSubcription");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.getAllFilter),
  customerSubcriptionController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.create),
  customerSubcriptionController.add,
);

/**
 * veryfy payment
 */
router.post(
  "/payment-verify",
  authCheckMiddleware,
  customerSubcriptionController.confirmOnlinePayment,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.get),
  customerSubcriptionController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.getById),
  customerSubcriptionController.getById,
);

/**
 * ledger document
 */
router.get(
  "/:id/ledger",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.getById),
  customerSubcriptionController.getLedgerById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.update),
  customerSubcriptionController.update,
);

/**
 * renew document
 */
router.put(
  "/:id/renew",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.renewSubscription),
  customerSubcriptionController.renewSubscription,
);

/**
 * upgrade document
 */
router.put(
  "/:id/upgrade",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.upgradeSubscriptionPlan),
  customerSubcriptionController.upgradeSubscriptionPlan,
);

/**
 * update payment
 */
router.put(
  "/:id/payment-in",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.updatePayment),
  customerSubcriptionController.updatePayment,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.changeStatus),
  customerSubcriptionController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(customerSubcriptionValidation.deleteDocument),
  customerSubcriptionController.deleteDocument,
);

module.exports = router;
