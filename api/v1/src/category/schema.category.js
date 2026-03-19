const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
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

const searchKeys = ["categoryName", "createdAt"];
module.exports = mongoose.model("Category", categorySchema);
module.exports.searchKeys = [...searchKeys];
