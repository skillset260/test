const express = require("express");
const router = express.Router();

const ReviewFeatureNatureController = require("./controller.reviewfeaturenature");
const {
  validateCreate,
  validateUpdate,
  validatePagination,
 
} = require("./validation.reviewfeaturenature");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");


router.post(
  "/filter",
  authCheckMiddleware,
  validatePagination,
  ReviewFeatureNatureController.allFilterPagination
);

// ─── List & Search ────────────────────────────────────────────────────────────
router.get("/", validatePagination, ReviewFeatureNatureController.getAll.bind(ReviewFeatureNatureController));
// ─── Get by ID ────────────────────────────────────────────────────────────────
router.get("/:id", ReviewFeatureNatureController.getById.bind(ReviewFeatureNatureController));

// ─── Create ───────────────────────────────────────────────────────────────────
router.post("/", validateCreate, ReviewFeatureNatureController.create.bind(ReviewFeatureNatureController));

// ─── Update ───────────────────────────────────────────────────────────────────
router.put("/:id", validateUpdate, ReviewFeatureNatureController.update.bind(ReviewFeatureNatureController));

// ─── Delete ───────────────────────────────────────────────────────────────────
router.delete("/:id", ReviewFeatureNatureController.delete.bind(ReviewFeatureNatureController));

module.exports = router;
