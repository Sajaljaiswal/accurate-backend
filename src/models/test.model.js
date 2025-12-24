const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["BLOOD", "USG", "XRAY", "MRI", "OTHER"],
      required: true,
    },

    // ✅ NEW FIELD
    sampleType: {
      type: String,
      enum: ["BLOOD", "URINE", "STOOL", "SALIVA", "IMAGING", "NA"],
      required: true,
      default: "NA",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
