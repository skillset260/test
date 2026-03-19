const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { genderEnum } = require("../../../utils/enumUtils");

const addressSchema = new mongoose.Schema({
  country: {
    type: String,
    default: "",
    trim: true,
  },
  state: {
    type: String,
    trim: true,
    default: "",
  },
  city: {
    type: String,
    trim: true,
    default: "",
  },
  pincode: {
    type: String,
    default: "",
    trim: true,
  },
  addressLine1: {
    type: String,
    default: "",
    trim: true,
  },
  addressLine2: {
    type: String,
    default: "",
    trim: true,
  },
  landmark: {
    type: String,
    default: "",
    trim: true,
  },
  addressType: {
    type: String,
    required: true,
  },
  houseNumber: {
    type: String,
    default: "",
    trim: true,
  },
});

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
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
    businessId: {
      type: String,
      unique: true,
      trim: true,
    },
    businessDisplayName: {
      type: String,
      required: true,
      trim: true,
    },
    googleBusinessLink: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: addressSchema,
      default: {},
    },
    employees: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          gender: {
            type: String,
            enum: [...Object.values(genderEnum)],
            required: true,
          },
        },
      ],
      default: [],
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
  {
    timestamps: true,
  },
);

const searchKeys = ["businessDisplayName", "createdAt"];
module.exports = mongoose.model("Profile", profileSchema);
module.exports.searchKeys = [...searchKeys];
