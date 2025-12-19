const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test", // optional if you have test master
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    /* ---------------- BASIC INFO ---------------- */
    panel: {
      type: String,
    },
    referredBy: {
      type: String,
    },
    title: {
      type: String,
      enum: ["Mr.", "Mrs.", "Miss.", "Dr.", "Ms.", "C/O"],
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
    },
    dateOfBirth: {
      type: Date,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    /* ---------------- ADDRESS ---------------- */
    address: {
      pincode: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
    },

    /* ---------------- VITALS ---------------- */
    vitals: {
      weight: Number, // kg
      height: Number, // cm
      bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      },
    },

    /* ---------------- TESTS ---------------- */
    tests: {
      type: [testSchema],
      default: [],
    },

    /* ---------------- BILLING ---------------- */
    billing: {
      grossTotal: {
        type: Number,
        required: true,
      },
      discountType: {
        type: String,
        enum: ["amount", "percent"],
        default: "amount",
      },
      discountValue: {
        type: Number,
        default: 0,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      netAmount: {
        type: Number,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING",
      },
    },

    /* ---------------- SYSTEM ---------------- */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // SUPERADMIN / STAFF
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);
