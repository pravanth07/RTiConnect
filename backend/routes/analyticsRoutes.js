const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  getOverviewStats,
  getMonthlyTrend,
  getDepartmentPerformance,
  getStatusDistribution,
  getPublicStats,
} = require("../controllers/analyticsController");

// Public route - transparency stats visible to everyone
router.get("/public", getPublicStats);

// Protected routes - CIO / Admin only
router.get("/overview", protect, authorize("cio", "admin"), getOverviewStats);
router.get("/monthly-trend", protect, authorize("cio", "admin"), getMonthlyTrend);
router.get("/department-performance", protect, authorize("cio", "admin"), getDepartmentPerformance);
router.get("/status-distribution", protect, authorize("cio", "admin"), getStatusDistribution);

module.exports = router;
