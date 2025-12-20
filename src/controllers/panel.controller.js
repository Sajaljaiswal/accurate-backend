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
    const panels = await Panel.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: panels.length,
      data: panels,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
