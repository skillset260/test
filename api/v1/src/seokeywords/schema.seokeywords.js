const mongoose = require("mongoose");
const reviewfeatureSchema = new mongoose.Schema(
  {
    catId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },
    subCatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategories",
      required: true,
    },
    reviewFeatureName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
   
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    
  }
);

module.exports = mongoose.model("ReviewFeature", reviewfeatureSchema);
