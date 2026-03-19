const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const seoKeywordSchema = new mongoose.Schema(
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
    keyword: {
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

const searchKeys = ["keyword", "createdAt"];
module.exports = mongoose.model("SeoKeyword", seoKeywordSchema);
module.exports.searchKeys = [...searchKeys];
