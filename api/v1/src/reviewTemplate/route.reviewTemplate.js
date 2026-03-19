const router = require("express").Router();
const reviewTemplateController = require("./controller.reviewTemplate");

// Public route (QR scan)
router.get(
  "/generate/:businessId",
  reviewTemplateController.getReviewTemplates,
);

module.exports = router;
