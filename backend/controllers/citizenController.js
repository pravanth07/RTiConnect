const RTIRequest = require('../models/RTIRequest');
const Appeal = require('../models/Appeal');
const { Notification } = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { calculateResponseDeadline, getDaysRemaining, getDeadlineStatus } = require('../utils/deadlineCalculator');

// @desc    Submit new RTI request
// @route   POST /api/citizen/rti
// @access  Citizen
const submitRTI = async (req, res) => {
  try {
    const { department, subject, description, isLifeOrLiberty } = req.body;

    const attachments = req.files
      ? req.files.map(f => ({ url: f.path, publicId: f.filename, originalName: f.originalname }))
      : [];

    const responseDeadline = calculateResponseDeadline({ isLifeOrLiberty: isLifeOrLiberty === 'true' });

    const request = await RTIRequest.create({
      citizen: req.user._id,
      department,
      subject,
      description,
      attachments,
      isLifeOrLiberty: isLifeOrLiberty === 'true',
      feePaid: req.user.isBPL, // BPL citizens exempt
      feeWaived: req.user.isBPL,
      responseDeadline,
      statusHistory: [{
        status: 'SUBMITTED',
        changedBy: req.user._id,
        note: 'Request submitted by citizen',
      }],
    });

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      template: 'requestSubmitted',
      data: [req.user.name, request.requestId, department],
    });

    // Create in-app notification
    await Notification.create({
      user: req.user._id,
      title: 'RTI Request Submitted',
      message: `Your request ${request.requestId} has been submitted successfully.`,
      type: 'REQUEST_SUBMITTED',
      relatedRequest: request._id,
      channels: ['IN_APP', 'EMAIL'],
    });

    res.status(201).json({
      success: true,
      message: 'RTI request submitted successfully.',
      request: {
        _id: request._id,
        requestId: request.requestId,
        status: request.status,
        department: request.department,
        responseDeadline: request.responseDeadline,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all RTI requests of citizen
// @route   GET /api/citizen/rti
// @access  Citizen
const getMyRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { citizen: req.user._id };
    if (status) query.status = status;

    const requests = await RTIRequest.find(query)
      .populate('assignedPIO', 'name email department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await RTIRequest.countDocuments(query);

    const enriched = requests.map(r => ({
      ...r.toObject(),
      deadlineStatus: getDeadlineStatus(r.responseDeadline),
      daysRemaining: getDaysRemaining(r.responseDeadline),
    }));

    res.status(200).json({ success: true, total, page: Number(page), requests: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track a specific RTI request
// @route   GET /api/citizen/rti/:id/track
// @access  Citizen
const trackRequest = async (req, res) => {
  try {
    const request = await RTIRequest.findOne({ _id: req.params.id, citizen: req.user._id })
      .populate('assignedPIO', 'name email designation department')
      .populate('statusHistory.changedBy', 'name role');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
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

// @desc    File a First or Second Appeal
// @route   POST /api/citizen/appeal
// @access  Citizen
const fileAppeal = async (req, res) => {
  try {
    const { rtiRequestId, type, reason } = req.body;

    const rtiRequest = await RTIRequest.findOne({ _id: rtiRequestId, citizen: req.user._id });
    if (!rtiRequest) {
      return res.status(404).json({ success: false, message: 'RTI Request not found.' });
    }

    // Validate appeal eligibility
    if (type === 'FIRST') {
      const validStatuses = ['RESPONDED', 'REJECTED', 'DEEMED_REFUSED', 'IN_PROGRESS'];
      if (!validStatuses.includes(rtiRequest.status)) {
        return res.status(400).json({ success: false, message: 'Cannot file First Appeal at this stage.' });
      }
    }
    if (type === 'SECOND') {
      const firstAppeal = await Appeal.findOne({ rtiRequest: rtiRequestId, type: 'FIRST', citizen: req.user._id });
      if (!firstAppeal) {
        return res.status(400).json({ success: false, message: 'First Appeal must be filed before Second Appeal.' });
      }
    }

    const attachments = req.files
      ? req.files.map(f => ({ url: f.path, publicId: f.filename, originalName: f.originalname }))
      : [];

    const appeal = await Appeal.create({
      rtiRequest: rtiRequestId,
      citizen: req.user._id,
      type,
      reason,
      attachments,
      statusHistory: [{ status: 'FILED', changedBy: req.user._id, note: 'Appeal filed by citizen' }],
    });

    // Update RTI request status
    rtiRequest.status = type === 'FIRST' ? 'FIRST_APPEAL' : 'SECOND_APPEAL';
    rtiRequest.statusHistory.push({ status: rtiRequest.status, changedBy: req.user._id });
    await rtiRequest.save();

    await sendEmail({
      to: req.user.email,
      template: 'appealFiled',
      data: [req.user.name, appeal.appealId, type],
    });

    res.status(201).json({ success: true, message: `${type} Appeal filed successfully.`, appeal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get citizen's appeals
// @route   GET /api/citizen/appeals
// @access  Citizen
const getMyAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find({ citizen: req.user._id })
      .populate('rtiRequest', 'requestId department subject status')
      .populate('assignedAuthority', 'name designation')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, appeals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get citizen notifications
// @route   GET /api/citizen/notifications
// @access  Citizen
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/citizen/notifications/:id/read
// @access  Citizen
const markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitRTI, getMyRequests, trackRequest, fileAppeal, getMyAppeals, getNotifications, markNotificationRead };
