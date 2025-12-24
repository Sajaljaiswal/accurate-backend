// models/doctor.model.js
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    title: String,
    fullName: { type: String, required: true },
    degree: String,
    specialization: String,
    clinicName: String,
    hospitalName: String,
    clinicAddress: String,
    mobile: String,
    clinicPhone: String,
    email: String,
    dob: Date,
    password: String,
    status: {
      type: String,
      enum: ["TAGGED", "UNTAGGED"],
      default: "UNTAGGED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
