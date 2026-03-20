const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { discountTypeEnum } = require("../../../utils/enumUtils");

const subsRenewalHistorySchema = new mongoose.Schema(
  {
    customerSubscriptionId: {
      type: ObjectId,
      required: true,
    },
    customerId: {
      type: ObjectId,
      default: null,
      trim: true,
    },
    customerName: {
      type: String,
      default: "",
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },
    subscriptionPlanId: {
      type: ObjectId,
      default: null,
      trim: true,
    },
    planName: {
      type: String,
      default: "",
      trim: true,
    },
    planPrice: {
      type: String,
      default: "",
      trim: true,
    },
    planStartDate: {
      type: String,
      default: "",
      trim: true,
    },
    planValidity: {
      type: Number,
      default: 0,
      trim: true,
    },
    planExpiryDate: {
      type: String,
      default: "",
      trim: true,
    },
    planRenewalDate: {
      type: String,
      default: "",
      trim: true,
    },
    discountType: {
      type: String,
      enum: [...Object.values(discountTypeEnum)],
      required: true,
      trim: true,
    },
    discountValue: {
      type: String,
      required: true,
    },
    calculatedDisAmt: {
      type: Number,
      default: 0,
    },
    amtAfterDiscount: {
      type: Number,
      default: 0,
    },
    receivedAmt: {
      type: Number,
      required: true,
    },
    dueAmt: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: String,
      default: "",
      trim: true,
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

const searchKeys = ["customerName", "createdAt"];

module.exports = mongoose.model("subsRenewalHistory", subsRenewalHistorySchema);
module.exports.searchKeys = [...searchKeys];
