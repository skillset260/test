const express = require("express");
const router = require("express").Router();
const transactionController = require("./controller.transaction");
const validate = require("../../middleware/validate");
const transactionValidation = require("./validation.transaction");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */
router.post(
  "/",
  authCheckMiddleware,
  validate(transactionValidation.getAllFilter),
  transactionController.allFilterPagination
);

router.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }),
  transactionController.razorpayWebhook
);

module.exports = router;
