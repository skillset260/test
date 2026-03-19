const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: ObjectId,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    subCategoryName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
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

const searchKeys = ["subCategoryName", "createdAt"];
module.exports = mongoose.model("Subcategory", subcategorySchema);
module.exports.searchKeys = [...searchKeys];
