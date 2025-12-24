const Patient = require("../models/patient.model");

const getStartOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.registerPatient = async (req, res) => {
  try {
    const data = req.body;

    /* -------------------------------
       1️⃣ DAILY REGISTRATION NUMBER
    --------------------------------*/
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await Patient.countDocuments({
      createdAt: { $gte: startOfDay },
    });

    const registrationNumber = (todayCount + 1)
      .toString()
      .padStart(3, "0"); // 001, 002, 003

    /* -------------------------------
       2️⃣ LAB NUMBER & ORDER ID
    --------------------------------*/
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const labNumber = `LAB-${todayStr}-${registrationNumber}`;

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    /* -------------------------------
       3️⃣ BILLING CALCULATION (SAFE)
    --------------------------------*/
    const grossTotal = data.tests.reduce(
      (sum, t) => sum + Number(t.price),
      0
    );

    let discountAmount = 0;
    if (data.billing.discountType === "percent") {
      discountAmount = (grossTotal * data.billing.discountValue) / 100;
    } else {
      discountAmount = Number(data.billing.discountValue || 0);
    }

    const netAmount = Math.max(0, grossTotal - discountAmount);

    const cashReceived = Number(data.billing.cashReceived || 0);
    const dueAmount = Math.max(0, netAmount - cashReceived);

    /* -------------------------------
       4️⃣ PAYMENT STATUS LOGIC
    --------------------------------*/
   let paymentStatus = "UNPAID";

if (cashReceived >= netAmount && netAmount > 0) {
  paymentStatus = "PAID";
} else if (cashReceived > 0 && cashReceived < netAmount) {
  paymentStatus = "PARTIAL";
}


    /* -------------------------------
       5️⃣ SAVE PATIENT
    --------------------------------*/
    const patient = await Patient.create({
      ...data,

      registrationNumber,
      labNumber,
      orderId,

      billing: {
        ...data.billing,
        grossTotal,
        discountAmount,
        netAmount,
        cashReceived,
        dueAmount,
        paymentStatus,
      },
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      fromDate,
      toDate,
    } = req.query;

    const skip = (page - 1) * limit;

    const query = {};

    // 🔍 Search (name / mobile / lab / order)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { labNumber: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    // 📅 Date filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate + "T23:59:59");
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate("panel", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Patient.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getTodayPatients = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Patient.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
