const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const reviewFeatureSchema = new mongoose.Schema(
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
    featureName: {
      type: String,
      trim: true,
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

const searchKeys = ["featureName", "createdAt"];
module.exports = mongoose.model("ReviewFeature", reviewFeatureSchema);
module.exports.searchKeys = [...searchKeys];
