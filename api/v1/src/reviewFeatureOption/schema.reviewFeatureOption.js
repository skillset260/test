const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const reviewFeatureOptionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: ObjectId,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    subCategoryId: {
      type: ObjectId,
      required: true,
    },
    subCategoryName: {
      type: String,
      required: true,
    },
    reviewFeatureId: {
      type: ObjectId,
      required: true,
    },
    reviewFeatureName: {
      type: String,
      required: true,
    },
    featureOption: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const searchKeys = ["featureOption", "createdAt"];
module.exports = mongoose.model(
  "ReviewFeatureOption",
  reviewFeatureOptionSchema,
);
module.exports.searchKeys = [...searchKeys];
