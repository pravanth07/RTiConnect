const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
  appealId: {
    type: String,
    unique: true,
  },
  rtiRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RTIRequest',
    required: true,
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['FIRST', 'SECOND'],
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Appeal reason is required'],
    maxlength: [2000, 'Reason cannot exceed 2000 characters'],
  },
  attachments: [{
    url: String,
    publicId: String,
    originalName: String,
  }],
  status: {
    type: String,
    enum: ['FILED', 'UNDER_REVIEW', 'HEARING_SCHEDULED', 'DECIDED', 'DISMISSED'],
    default: 'FILED',
  },
  assignedAuthority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  hearingDate: Date,
  hearingNotes: String,

  // Decision
  decision: {
    type: String,
    enum: ['UPHELD', 'REJECTED', 'REMANDED', 'PENALTY_IMPOSED', null],
    default: null,
  },
  decisionDetails: String,
  penaltyAmount: {
    type: Number,
    default: 0, // Section 20: ₹250/day, max ₹25,000
  },
  disciplinaryActionRecommended: {
    type: Boolean,
    default: false,
  },
  decidedAt: Date,
  decidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Deadlines — Section 19: 30 days (max 45 days)
  responseDeadline: Date,

  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],
}, { timestamps: true });

appealSchema.pre('save', async function (next) {
  if (!this.appealId) {
    const count = await mongoose.model('Appeal').countDocuments();
    const year = new Date().getFullYear();
    this.appealId = `APPEAL/${year}/${String(count + 1).padStart(5, '0')}`;
  }
  if (!this.responseDeadline) {
    this.responseDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Appeal', appealSchema);
