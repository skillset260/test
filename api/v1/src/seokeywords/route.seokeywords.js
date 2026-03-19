const express = require("express");
const router = express.Router();

const reviewFeatureController = require("./controller.reviewfeature");
const {
  validateCreate,
  validateUpdate,
  validatePagination,
 
} = require("./validation.reviewfeature");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");


router.post(
  "/filter",
  authCheckMiddleware,
  validatePagination,
  reviewFeatureController.allFilterPagination
);

// ─── List & Search ────────────────────────────────────────────────────────────
router.get("/", validatePagination, reviewFeatureController.getAll.bind(reviewFeatureController));
// ─── Get by ID ────────────────────────────────────────────────────────────────
router.get("/:id", reviewFeatureController.getById.bind(reviewFeatureController));

// ─── Create ───────────────────────────────────────────────────────────────────
router.post("/", validateCreate, reviewFeatureController.create.bind(reviewFeatureController));

// ─── Update ───────────────────────────────────────────────────────────────────
router.put("/:id", validateUpdate, reviewFeatureController.update.bind(reviewFeatureController));

// ─── Delete ───────────────────────────────────────────────────────────────────
router.delete("/:id", reviewFeatureController.delete.bind(reviewFeatureController));

module.exports = router;
