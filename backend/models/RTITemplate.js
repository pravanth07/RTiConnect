const mongoose = require("mongoose");

const rtiTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Template title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Education",
        "Healthcare",
        "Infrastructure",
        "Finance",
        "Police",
        "Municipal",
        "Land & Revenue",
        "Public Works",
        "Employment",
        "Environment",
        "General",
      ],
    },
    department: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    templateBody: {
      type: String,
      required: [true, "Template body is required"],
    },
    placeholders: [
      {
        key: { type: String, required: true },       // e.g. {{DISTRICT_NAME}}
        label: { type: String, required: true },      // e.g. "Enter your district name"
        type: { type: String, default: "text" },      // text, date, number, textarea
        required: { type: Boolean, default: true },
      },
    ],
    sampleQuestions: {
      type: [String],
      default: [],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

rtiTemplateSchema.index({ category: 1, isActive: 1 });
rtiTemplateSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("RTITemplate", rtiTemplateSchema);
