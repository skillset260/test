const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { planDurationEnum } = require("../../../utils/enumUtils");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    planPrice: {
      type: Number,
      required: true,
      trim: true,
    },
    planDuration: {
      type: String,
      required: true,
      enum: [...Object.values(planDurationEnum)],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const searchKeys = ["planName", "createdAt"];

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
module.exports.searchKeys = [...searchKeys];
