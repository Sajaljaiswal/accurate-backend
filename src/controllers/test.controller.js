const Test = require("../models/test.model");

exports.addTest = async (req, res) => {
  try {
    const { 
      name, 
      shortName, 
      category, 
      unit, 
      inputType, 
      defaultPrice, 
      defaultResult, 
      isOptional,
      referenceRanges,
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
      
      defaultPrice,
      referenceRanges,
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
    const { page = 1, limit = 10, search = "", category = "", status = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build Query Object
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
      if (category) {
      query.category = new mongoose.Types.ObjectId(category); 
    }
    if (status) {
      query.isActive = status === "active";
    }

    const [tests, totalItems] = await Promise.all([
      Test.find(query)
        .populate("category", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Test.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: tests,
      pagination: {
        totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalItems / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPatientsCountByDate = async (req, res) => {
  try {
    const selectedDate = req.query.date; // e.g., "2026-01-01"
    
    // Create start and end of that specific day
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    const count = await Patient.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    res.json({
      success: true,
      count: count
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Test deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const updated = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }
    res.json({
      success: true,
      message: "Test updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
