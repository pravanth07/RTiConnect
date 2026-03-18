const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTemplates,
  getTemplateById,
  generateFromTemplate,
  getCategories,
} = require("../controllers/templateController");

router.get("/categories", protect, getCategories);
router.get("/", protect, getTemplates);
router.get("/:id", protect, getTemplateById);
router.post("/:id/generate", protect, generateFromTemplate);

module.exports = router;
