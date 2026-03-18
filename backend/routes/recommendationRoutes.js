const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  recommendDepartment,
  getAllDepartments,
} = require("../controllers/recommendationController");

router.post("/department", protect, recommendDepartment);
router.get("/departments", protect, getAllDepartments);

module.exports = router;
