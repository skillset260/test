const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const customerLedgerSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
      required: true,
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

const searchKeys = ["createdAt"];

module.exports = mongoose.model("CustomerLedger", customerLedgerSchema);
module.exports.searchKeys = [...searchKeys];
