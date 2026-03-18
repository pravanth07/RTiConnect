const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      required: true,
      index: true,
    },
    contactEmail: {
      type: String,
    },
    pioAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for keyword search
departmentSchema.index({ name: "text", description: "text", keywords: "text" });

module.exports = mongoose.model("Department", departmentSchema);
