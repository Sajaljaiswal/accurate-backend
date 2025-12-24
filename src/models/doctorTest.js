
const mongoose = require("mongoose");

const doctorTestSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    // doctor-specific override price
    customPrice: {
      type: Number,
      min: 0,
      default: null, // null = use test.defaultPrice
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// one test once per doctor
doctorTestSchema.index({ doctor: 1, test: 1 }, { unique: true });

module.exports = mongoose.model("DoctorTest", doctorTestSchema);
