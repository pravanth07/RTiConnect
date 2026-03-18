const Department = require("../models/Department");

// @desc    Get department recommendations based on user query
// @route   POST /api/recommend/department
// @access  Private (Citizen)
const recommendDepartment = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please provide a query with at least 3 characters",
      });
    }

    const searchWords = query
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2);

    if (searchWords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide meaningful keywords in your query",
      });
    }

    // Method 1: MongoDB text search
    const textResults = await Department.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    // Method 2: Keyword array matching (fallback / boost)
    const keywordRegex = searchWords.map((word) => new RegExp(word, "i"));
    const keywordResults = await Department.aggregate([
      { $match: { isActive: true, keywords: { $in: keywordRegex } } },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: "$keywords",
                as: "kw",
                cond: {
                  $or: keywordRegex.map((regex) => ({
                    $regexMatch: { input: "$$kw", regex: regex.source, options: "i" },
                  })),
                },
              },
            },
          },
        },
      },
      { $sort: { matchCount: -1 } },
      { $limit: 5 },
    ]);

    // Merge and deduplicate results
    const seen = new Set();
    const combined = [];

    // Text search results first (usually more relevant)
    for (const dept of textResults) {
      if (!seen.has(dept._id.toString())) {
        seen.add(dept._id.toString());
        combined.push({
          _id: dept._id,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          keywords: dept.keywords,
          confidence: Math.min(95, Math.round((dept._doc.score || 1) * 30)),
        });
      }
    }

    // Keyword match results
    for (const dept of keywordResults) {
      if (!seen.has(dept._id.toString())) {
        seen.add(dept._id.toString());
        combined.push({
          _id: dept._id,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          keywords: dept.keywords,
          confidence: Math.min(85, dept.matchCount * 20),
        });
      }
    }

    // Sort by confidence descending
    combined.sort((a, b) => b.confidence - a.confidence);

    res.status(200).json({
      success: true,
      count: combined.length,
      query: query,
      recommendations: combined.slice(0, 5),
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding department recommendations",
    });
  }
};

// @desc    Get all active departments
// @route   GET /api/recommend/departments
// @access  Private
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select("name code description keywords")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
    });
  }
};

module.exports = { recommendDepartment, getAllDepartments };
