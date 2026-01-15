const Panel = require("../models/panel.model");

exports.registerPanel = async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    if (!data.name || !data.contact?.mobile) {
      return res.status(400).json({
        success: false,
        message: "Hospital name and mobile are required",
      });
    }

    const panel = await Panel.create({
      name: data.name,
      organizationType: data.organizationType,
      address: {
        fullAddress: data.address?.fullAddress,
        pincode: data.address?.pincode,
      },
      contact: {
        mobile: data.contact.mobile,
        email: data.contact.email,
        website: data.contact.website,
      },
      billing: {
        gstNumber: data.billing?.gstNumber,
        panNumber: data.billing?.panNumber,
        creditLimit: data.billing?.creditLimit,
        paymentCycle: data.billing?.paymentCycle,
      },
      portalUsername: data.portalUsername,
      isActive: data.isActive,
      createdBy: req.user?._id, // optional (JWT)
    });

    res.status(201).json({
      success: true,
      message: "Hospital / Clinic registered successfully",
      data: panel,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Portal username already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllPanels = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [panels, totalItems] = await Promise.all([
      Panel.find(query)
        .sort({ name: 1 }) // Sort alphabetically for easier selection
        .skip(skip)
        .limit(limitNum),
      Panel.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: panels,
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
