const express = require("express");
const router = express.Router();
const Category = require("../models/category.model");

router.post("/addCategories", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ name: name.trim() });
    await newCategory.save();

    res.status(201).json({ 
      success: true, 
      message: "Category created successfully", 
      data: newCategory 
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: Fetch all categories (to populate the dropdown in Add Test form)
router.get("/allCategories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

module.exports = router;