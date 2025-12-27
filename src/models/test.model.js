// models/Test.js
const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    shortName: { type: String }, // Added based on your UI
    unit: { type: String }, // Added based on your UI
    inputType: {
      type: String,
      enum: ["Numeric", "Text", "RichText"],
      default: "Numeric",
    },
  referenceRanges: [{
    gender: { type: String, enum: ["Male", "Female", "BOTH"], default: "BOTH" },
    ageMin: { type: Number, default: 0 },
    ageMax: { type: Number, default: 100 },
    lowRange: { type: String },
    highRange: { type: String },
    unit: { type: String } // Can be inherited from test unit
  }],
    defaultPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    defaultResult: { type: String },
    isOptional: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
