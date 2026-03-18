const RTITemplate = require("../models/RTITemplate");

// @desc    Get all templates (optionally filter by category)
// @route   GET /api/templates
// @access  Private (Citizen)
const getTemplates = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const templates = await RTITemplate.find(filter)
      .select("title category department description sampleQuestions usageCount")
      .sort({ usageCount: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching templates",
    });
  }
};

// @desc    Get single template with full body and placeholders
// @route   GET /api/templates/:id
// @access  Private (Citizen)
const getTemplateById = async (req, res) => {
  try {
    const template = await RTITemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching template",
    });
  }
};

// @desc    Generate filled RTI application from template
// @route   POST /api/templates/:id/generate
// @access  Private (Citizen)
const generateFromTemplate = async (req, res) => {
  try {
    const template = await RTITemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    const { values } = req.body; // { "{{DISTRICT_NAME}}": "Karimnagar", ... }

    if (!values || typeof values !== "object") {
      return res.status(400).json({
        success: false,
        message: "Please provide placeholder values",
      });
    }

    // Check required placeholders
    const missing = template.placeholders
      .filter((p) => p.required && (!values[p.key] || values[p.key].trim() === ""))
      .map((p) => p.label);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Replace placeholders in template body
    let generatedApplication = template.templateBody;
    for (const [key, value] of Object.entries(values)) {
      generatedApplication = generatedApplication.replace(
        new RegExp(key.replace(/[{}]/g, "\\$&"), "g"),
        value
      );
    }

    // Add current date
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    generatedApplication = generatedApplication.replace(/\{\{DATE\}\}/g, today);

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    res.status(200).json({
      success: true,
      generatedApplication,
      templateTitle: template.title,
      department: template.department,
    });
  } catch (error) {
    console.error("Template generation error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating RTI application",
    });
  }
};

// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await RTITemplate.distinct("category", { isActive: true });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  generateFromTemplate,
  getCategories,
};
