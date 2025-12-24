const Test = require("../models/test.model");

exports.addTest = async (req, res) => {
  try {
    const { name, category, sampleType, price } = req.body;

    if (!name || !category || !sampleType || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const test = await Test.create({
      name,
      category,
      sampleType,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Test added successfully",
      data: test,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: tests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
