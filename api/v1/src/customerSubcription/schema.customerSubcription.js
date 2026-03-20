const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  discountTypeEnum,
  paymentMethod,
  transactionStatus,
  planStatusEnum,
} = require("../../../utils/enumUtils");

const customerSubcriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: ObjectId,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
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
    planAddedOn: {
      type: String,
      default: "",
      trim: true,
    },
    planStartDate: {
      type: String,
      default: "",
      trim: true,
    },
    planDuration: {
      type: String,
      default: "",
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
    adjustmentAmount: {
      type: Number,
      default: 0,
    },
    adjustmentDate: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: [...Object.values(paymentMethod)],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: [...Object.values(transactionStatus)],
      default: transactionStatus.pending,
    },
    planStatus: {
      type: String,
      enum: [...Object.values(planStatusEnum)],
      default: planStatusEnum.pending,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },
    razorpayOrderId: {
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

const searchKeys = ["planName", "customerName", "createdAt"];

module.exports = mongoose.model(
  "CustomerSubcription",
  customerSubcriptionSchema,
);
module.exports.searchKeys = [...searchKeys];
