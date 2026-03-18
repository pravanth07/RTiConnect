const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['REQUEST_SUBMITTED', 'REQUEST_ASSIGNED', 'REQUEST_RESPONDED',
           'REQUEST_REJECTED', 'APPEAL_FILED', 'APPEAL_DECIDED',
           'DEADLINE_WARNING', 'FEE_REQUIRED', 'GENERAL'],
    default: 'GENERAL',
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RTIRequest',
  },
  relatedAppeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appeal',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  channels: [{
    type: String,
    enum: ['IN_APP', 'EMAIL', 'SMS'],
  }],
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RTIRequest',
  },
  targetAppeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appeal',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = { Notification, AuditLog };
