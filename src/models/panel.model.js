const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema(
  {
    /* ---------------- BASIC INFO ---------------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    organizationType: {
      type: String,
      enum: [
        "Private Limited",
        "Government / Trust",
        "Individual Clinic",
        "Partnership",
      ],
    },

    address: {
      fullAddress: String,
      pincode: String,
    },

    /* ---------------- CONTACT ---------------- */
    contact: {
      mobile: {
        type: String,
      },
      email: {
        type: String,
        lowercase: true,
      },
      website: String,
    },

    /* ---------------- BILLING ---------------- */
    billing: {
      gstNumber: String,
      panNumber: String,
      creditLimit: {
        type: Number,
        default: 0,
      },
      paymentCycle: {
        type: String,
        enum: ["Prepaid", "Weekly", "Monthly"],
        default: "Prepaid",
      },
    },

    /* ---------------- SECURITY ---------------- */
    portalUsername: {
      type: String,
      unique: true,
      sparse: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ---------------- DOCUMENTS ---------------- */
    registrationDocument: {
      type: String, // file path or URL
    },

    /* ---------------- SYSTEM ---------------- */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Panel", panelSchema);
