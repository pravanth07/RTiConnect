const RTIRequest = require('../models/RTIRequest');
const User = require('../models/User');
const { Notification } = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { getDaysRemaining, getDeadlineStatus, calculatePenalty } = require('../utils/deadlineCalculator');

// @desc    Get all requests assigned to PIO
// @route   GET /api/pio/requests
// @access  PIO
const getAssignedRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { assignedPIO: req.user._id };
    if (status) query.status = status;

    const requests = await RTIRequest.find(query)
      .populate('citizen', 'name email phone isBPL')
      .sort({ responseDeadline: 1 }) // Sort by soonest deadline
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await RTIRequest.countDocuments(query);

    const enriched = requests.map(r => ({
      ...r.toObject(),
      deadlineStatus: getDeadlineStatus(r.responseDeadline),
      daysRemaining: getDaysRemaining(r.responseDeadline),
      potentialPenalty: calculatePenalty(r.responseDeadline),
    }));

    res.status(200).json({ success: true, total, requests: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single request detail
// @route   GET /api/pio/requests/:id
// @access  PIO
const getRequestDetail = async (req, res) => {
  try {
    const request = await RTIRequest.findOne({ _id: req.params.id, assignedPIO: req.user._id })
      .populate('citizen', 'name email phone address isBPL')
      .populate('statusHistory.changedBy', 'name role');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or not assigned to you.' });
    }

    res.status(200).json({
      success: true,
      request: {
        ...request.toObject(),
        deadlineStatus: getDeadlineStatus(request.responseDeadline),
        daysRemaining: getDaysRemaining(request.responseDeadline),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to RTI request
// @route   PUT /api/pio/requests/:id/respond
// @access  PIO
const respondToRequest = async (req, res) => {
  try {
    const { response } = req.body;
    const request = await RTIRequest.findOne({ _id: req.params.id, assignedPIO: req.user._id })
      .populate('citizen', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const responseDocuments = req.files
      ? req.files.map(f => ({ url: f.path, publicId: f.filename, originalName: f.originalname }))
      : [];

    request.response = response;
    request.responseDocuments = responseDocuments;
    request.status = 'RESPONDED';
    request.respondedAt = new Date();
    request.respondedBy = req.user._id;
    request.statusHistory.push({ status: 'RESPONDED', changedBy: req.user._id, note: 'PIO submitted response' });

    await request.save();

    // Notify citizen
    await sendEmail({
      to: request.citizen.email,
      template: 'requestResponded',
      data: [request.citizen.name, request.requestId, response],
    });

    await Notification.create({
      user: request.citizen._id,
      title: 'RTI Response Received',
      message: `Your request ${request.requestId} has been responded to by the PIO.`,
      type: 'REQUEST_RESPONDED',
      relatedRequest: request._id,
      channels: ['IN_APP', 'EMAIL'],
    });

    res.status(200).json({ success: true, message: 'Response submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject RTI request
// @route   PUT /api/pio/requests/:id/reject
// @access  PIO
const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason, exemptionSection } = req.body;
    const request = await RTIRequest.findOne({ _id: req.params.id, assignedPIO: req.user._id })
      .populate('citizen', 'name email');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    request.status = 'REJECTED';
    request.rejectionReason = `${rejectionReason} ${exemptionSection ? `(Section 8(1)(${exemptionSection}))` : ''}`;
    request.rejectedAt = new Date();
    request.statusHistory.push({ status: 'REJECTED', changedBy: req.user._id, note: rejectionReason });

    await request.save();

    await Notification.create({
      user: request.citizen._id,
      title: 'RTI Request Rejected',
      message: `Your request ${request.requestId} was rejected. Reason: ${rejectionReason}. You may file a First Appeal within 30 days.`,
      type: 'REQUEST_REJECTED',
      relatedRequest: request._id,
      channels: ['IN_APP', 'EMAIL'],
    });

    res.status(200).json({ success: true, message: 'Request rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer RTI to another department (Section 6(3))
// @route   PUT /api/pio/requests/:id/transfer
// @access  PIO
const transferRequest = async (req, res) => {
  try {
    const { transferredTo, transferReason } = req.body;
    const request = await RTIRequest.findOne({ _id: req.params.id, assignedPIO: req.user._id });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    // Transfer must happen within 5 days (Section 6(3))
    const daysSinceSubmission = Math.floor((new Date() - request.createdAt) / (1000 * 60 * 60 * 24));
    if (daysSinceSubmission > 5) {
      return res.status(400).json({ success: false, message: 'Transfer period of 5 days (Section 6(3)) has expired.' });
    }

    request.status = 'TRANSFERRED';
    request.transferredTo = transferredTo;
    request.transferReason = transferReason;
    request.transferredAt = new Date();
    request.statusHistory.push({ status: 'TRANSFERRED', changedBy: req.user._id, note: `Transferred to: ${transferredTo}` });

    await request.save();

    res.status(200).json({ success: true, message: 'Request transferred successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request additional fee
// @route   PUT /api/pio/requests/:id/request-fee
// @access  PIO
const requestAdditionalFee = async (req, res) => {
  try {
    const { additionalFeeRequired } = req.body;
    const request = await RTIRequest.findOne({ _id: req.params.id, assignedPIO: req.user._id });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    request.additionalFeeRequired = additionalFeeRequired;
    request.status = 'AWAITING_FEES';
    request.statusHistory.push({ status: 'AWAITING_FEES', changedBy: req.user._id, note: `Additional fee required: ₹${additionalFeeRequired}` });

    await request.save();

    res.status(200).json({ success: true, message: 'Fee request sent to citizen.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    PIO dashboard stats
// @route   GET /api/pio/stats
// @access  PIO
const getPIOStats = async (req, res) => {
  try {
    const baseQuery = { assignedPIO: req.user._id };

    const [total, pending, responded, overdue, rejected] = await Promise.all([
      RTIRequest.countDocuments(baseQuery),
      RTIRequest.countDocuments({ ...baseQuery, status: 'IN_PROGRESS' }),
      RTIRequest.countDocuments({ ...baseQuery, status: 'RESPONDED' }),
      RTIRequest.countDocuments({ ...baseQuery, responseDeadline: { $lt: new Date() }, status: { $nin: ['RESPONDED', 'CLOSED', 'REJECTED'] } }),
      RTIRequest.countDocuments({ ...baseQuery, status: 'REJECTED' }),
    ]);

    res.status(200).json({ success: true, stats: { total, pending, responded, overdue, rejected } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAssignedRequests, getRequestDetail, respondToRequest, rejectRequest, transferRequest, requestAdditionalFee, getPIOStats };
