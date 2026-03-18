const mongoose = require('mongoose');

const RTI_STATUSES = [
  'SUBMITTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'AWAITING_FEES',
  'RESPONDED',
  'FIRST_APPEAL',
  'SECOND_APPEAL',
  'CLOSED',
  'REJECTED',
  'DEEMED_REFUSED',
  'TRANSFERRED',
];

const rtiRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters'],
  },
  attachments: [{
    url: String,
    publicId: String,
    originalName: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: RTI_STATUSES,
    default: 'SUBMITTED',
  },
  assignedPIO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedAt: Date,

  // RTI Act Section 7 - 30 day deadline
  responseDeadline: {
    type: Date,
  },
  isLifeOrLiberty: {
    type: Boolean,
    default: false, // If true, 48-hour deadline applies
  },

  // PIO Response
  response: {
    type: String,
    trim: true,
  },
  responseDocuments: [{
    url: String,
    publicId: String,
    originalName: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  respondedAt: Date,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Rejection
  rejectionReason: {
    type: String,
  },
  rejectedAt: Date,

  // Transfer
  transferredTo: String,
  transferReason: String,
  transferredAt: Date,

  // Fee
  feePaid: {
    type: Boolean,
    default: false,
  },
  feeAmount: {
    type: Number,
    default: 10, // Default ₹10
  },
  feeWaived: {
    type: Boolean,
    default: false, // BPL citizens
  },
  additionalFeeRequired: {
    type: Number,
    default: 0,
  },

  // Timeline/History
  statusHistory: [{
    status: { type: String, enum: RTI_STATUSES },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],

  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
  },
}, { timestamps: true });

// Auto-generate requestId before save
rtiRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const count = await mongoose.model('RTIRequest').countDocuments();
    const year = new Date().getFullYear();
    this.requestId = `RTI/${year}/${String(count + 1).padStart(6, '0')}`;
  }
  // Set deadline: 30 days from submission (or 2 days if life/liberty)
  if (!this.responseDeadline) {
    const days = this.isLifeOrLiberty ? 2 : 30;
    this.responseDeadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('RTIRequest', rtiRequestSchema);
