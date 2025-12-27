const Test = require("../models/test.model");

exports.addTest = async (req, res) => {
  try {
    // 1. Destructure all new fields from the request body
    const { 
      name, 
      shortName, 
      category, 
      unit, 
      inputType, 
      sampleType, 
      defaultPrice, 
      defaultResult, 
      isOptional,
      isActive 
    } = req.body;

    if (!name || !category || defaultPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, Category, and Price are required fields",
      });
    }

    const test = await Test.create({
      name,
      shortName,
      category, 
      unit,
      inputType,
      sampleType,
      defaultPrice,
      defaultResult,
      isOptional,
      isActive
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
    const tests = await Test.find({ isActive: true })
      .populate("category", "name") 
       .sort({ name: 1 });

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
