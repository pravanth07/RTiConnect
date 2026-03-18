const RTIRequest = require("../models/RTIRequest");
const Appeal = require("../models/Appeal");
const User = require("../models/User");

// @desc    Get overall RTI statistics
// @route   GET /api/analytics/overview
// @access  Private (CIO / Admin)
const getOverviewStats = async (req, res) => {
  try {
    const totalRequests = await RTIRequest.countDocuments();
    const statusCounts = await RTIRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const totalAppeals = await Appeal.countDocuments();
    const totalUsers = await User.countDocuments({ role: "citizen" });
    const totalPIOs = await User.countDocuments({ role: "pio" });

    // Requests in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = await RTIRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Resolved requests
    const resolvedCount = await RTIRequest.countDocuments({
      status: { $in: ["RESPONDED", "CLOSED"] },
    });

    // Average resolution time (in days)
    const avgResolution = await RTIRequest.aggregate([
      { $match: { status: { $in: ["RESPONDED", "CLOSED"] }, updatedAt: { $exists: true } } },
      {
        $project: {
          resolutionDays: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      { $group: { _id: null, avgDays: { $avg: "$resolutionDays" } } },
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        resolvedCount,
        pendingCount: totalRequests - resolvedCount,
        recentRequests,
        totalAppeals,
        totalUsers,
        totalPIOs,
        avgResolutionDays: avgResolution[0]?.avgDays
          ? Math.round(avgResolution[0].avgDays * 10) / 10
          : 0,
        statusBreakdown: statusMap,
      },
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ success: false, message: "Error fetching analytics" });
  }
};

// @desc    Get monthly RTI request trend (last 12 months)
// @route   GET /api/analytics/monthly-trend
// @access  Private (CIO / Admin)
const getMonthlyTrend = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const trend = await RTIRequest.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ["$status", ["RESPONDED", "CLOSED"]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formatted = trend.map((item) => ({
      month: `${months[item._id.month - 1]} ${item._id.year}`,
      submitted: item.submitted,
      resolved: item.resolved,
    }));

    res.status(200).json({ success: true, trend: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching monthly trend" });
  }
};

// @desc    Get department-wise performance
// @route   GET /api/analytics/department-performance
// @access  Private (CIO / Admin)
const getDepartmentPerformance = async (req, res) => {
  try {
    const performance = await RTIRequest.aggregate([
      {
        $group: {
          _id: "$department",
          total: { $sum: 1 },
          responded: {
            $sum: {
              $cond: [{ $in: ["$status", ["RESPONDED", "CLOSED"]] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [
                { $in: ["$status", ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"]] },
                1,
                0,
              ],
            },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
          avgResolutionDays: {
            $avg: {
              $cond: [
                { $in: ["$status", ["RESPONDED", "CLOSED"]] },
                {
                  $divide: [
                    { $subtract: ["$updatedAt", "$createdAt"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
                null,
              ],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const formatted = performance.map((dept) => ({
      department: dept._id || "Unassigned",
      total: dept.total,
      responded: dept.responded,
      pending: dept.pending,
      rejected: dept.rejected,
      avgResolutionDays: dept.avgResolutionDays
        ? Math.round(dept.avgResolutionDays * 10) / 10
        : 0,
      resolutionRate:
        dept.total > 0 ? Math.round((dept.responded / dept.total) * 100) : 0,
    }));

    res.status(200).json({ success: true, departments: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching department stats" });
  }
};

// @desc    Get status-wise pie chart data
// @route   GET /api/analytics/status-distribution
// @access  Private (CIO / Admin)
const getStatusDistribution = async (req, res) => {
  try {
    const distribution = await RTIRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const colors = {
      SUBMITTED: "#3B82F6",
      ASSIGNED: "#8B5CF6",
      IN_PROGRESS: "#F59E0B",
      AWAITING_FEES: "#EF4444",
      RESPONDED: "#10B981",
      FIRST_APPEAL: "#EC4899",
      SECOND_APPEAL: "#F97316",
      CLOSED: "#6B7280",
      REJECTED: "#DC2626",
    };

    const formatted = distribution.map((item) => ({
      status: item._id,
      count: item.count,
      color: colors[item._id] || "#9CA3AF",
    }));

    res.status(200).json({ success: true, distribution: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching status distribution" });
  }
};

// @desc    Public transparency stats (no auth required)
// @route   GET /api/analytics/public
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const totalRequests = await RTIRequest.countDocuments();
    const resolvedCount = await RTIRequest.countDocuments({
      status: { $in: ["RESPONDED", "CLOSED"] },
    });
    const totalAppeals = await Appeal.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        resolvedCount,
        totalAppeals,
        resolutionRate:
          totalRequests > 0
            ? Math.round((resolvedCount / totalRequests) * 100)
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching public stats" });
  }
};

module.exports = {
  getOverviewStats,
  getMonthlyTrend,
  getDepartmentPerformance,
  getStatusDistribution,
  getPublicStats,
};
