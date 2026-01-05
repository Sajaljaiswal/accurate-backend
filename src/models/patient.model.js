const mongoose = require("mongoose");

// This schema represents the test state AT THE TIME of registration/reporting
const patientTestSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    defaultResult: {
      type: String,
      default: "",
    },
    // Stores the edited content from CKEditor
    richTextContent: {
      type: String,
      default: "",
    },
    // Remembers if this test was "range" or "text" mode
    reportType: {
      type: String,
      enum: ["range", "text"],
      default: "range",
    },
    /* --- ADDED FIELDS FOR LAB RESULTS --- */
    resultValue: {
      type: String, // String to allow for non-numeric results like "Positive"
      default: "", 
    },
    unit: {
      type: String, // e.g., "cumm" or "g/dl"
    },
    referenceRange: {
      type: String, // e.g., "0 - 440"
    },
    status: {
      type: String,
      enum: ["Pending", "Authorized", "Cancelled"],
      default: "Pending",
    }
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    labNumber: { type: String, unique: true },
    registrationNumber: { type: String, unique: true },
    orderId: { type: String, unique: true },

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

    tests: {
      type: [patientTestSchema],
      default: [],
    },

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

      discountReason: {
        type: String,
        trim: true,
      },
       approvedBy: {
        type: String,
        trim: true,
      },

      netAmount: {
        type: Number,
        required: true,
      },

      cashReceived: {
        type: Number,
      },

      dueAmount: {
        type: Number,
        default: 0,
      },

      paymentStatus: {
        type: String,
        enum: ["PAID", "PARTIAL", "PENDING", "UNPAID", "REFUNDED"],
        default: "PENDING",
      },
    },

    createdBy: {
      type: String,
      ref: "User", // SUPERADMIN / STAFF
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model("Patient", patientSchema);
