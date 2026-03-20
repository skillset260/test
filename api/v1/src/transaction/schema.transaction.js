const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  paymentMethod,
  transactionStatus,
} = require("../../../utils/enumUtils");

const transactionSchema = new mongoose.Schema(
  {
    req: {
      type: Object,
      default: {},
    },
    res: {
      type: Object,
      default: {},
    },
    customerId: {
      type: ObjectId,
      default: null,
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
    planId: {
      type: ObjectId,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },
    paymentId: {
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

module.exports = mongoose.model("Transaction", transactionSchema);
module.exports.searchKeys = [...searchKeys];
