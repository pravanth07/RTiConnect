const Appeal = require('../models/Appeal');
const RTIRequest = require('../models/RTIRequest');
const { Notification } = require('../models/Notification');
const { getDaysRemaining, getDeadlineStatus, calculatePenalty } = require('../utils/deadlineCalculator');

// @desc    Get all appeals
// @route   GET /api/appellate/appeals
// @access  Appellate
const getAllAppeals = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const appeals = await Appeal.find(query)
      .populate('citizen', 'name email phone')
      .populate('rtiRequest', 'requestId department subject status')
      .populate('assignedAuthority', 'name designation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appeal.countDocuments(query);

    const enriched = appeals.map(a => ({
      ...a.toObject(),
      deadlineStatus: getDeadlineStatus(a.responseDeadline),
      daysRemaining: getDaysRemaining(a.responseDeadline),
    }));

    res.status(200).json({ success: true, total, appeals: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appeal detail
// @route   GET /api/appellate/appeals/:id
// @access  Appellate
const getAppealDetail = async (req, res) => {
  try {
    const appeal = await Appeal.findById(req.params.id)
      .populate('citizen', 'name email phone address')
      .populate('rtiRequest')
      .populate('assignedAuthority', 'name designation')
      .populate('statusHistory.changedBy', 'name role');

    if (!appeal) return res.status(404).json({ success: false, message: 'Appeal not found.' });

    res.status(200).json({ success: true, appeal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign appeal to self or another authority
// @route   PUT /api/appellate/appeals/:id/assign
// @access  Appellate
const assignAppeal = async (req, res) => {
  try {
    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ success: false, message: 'Appeal not found.' });

    appeal.assignedAuthority = req.body.authorityId || req.user._id;
    appeal.status = 'UNDER_REVIEW';
    appeal.statusHistory.push({ status: 'UNDER_REVIEW', changedBy: req.user._id, note: 'Appeal taken under review' });
    await appeal.save();

    res.status(200).json({ success: true, message: 'Appeal assigned.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Schedule hearing
// @route   POST /api/appellate/hearing
// @access  Appellate
const scheduleHearing = async (req, res) => {
  try {
    const { appealId, hearingDate, hearingNotes } = req.body;
    const appeal = await Appeal.findById(appealId).populate('citizen', 'name email');

    if (!appeal) return res.status(404).json({ success: false, message: 'Appeal not found.' });

    appeal.hearingDate = new Date(hearingDate);
    appeal.hearingNotes = hearingNotes;
    appeal.status = 'HEARING_SCHEDULED';
    appeal.statusHistory.push({ status: 'HEARING_SCHEDULED', changedBy: req.user._id, note: `Hearing scheduled for ${new Date(hearingDate).toLocaleDateString('en-IN')}` });

    await appeal.save();

    await Notification.create({
      user: appeal.citizen._id,
      title: 'Hearing Scheduled',
      message: `A hearing for your appeal ${appeal.appealId} has been scheduled on ${new Date(hearingDate).toLocaleDateString('en-IN')}.`,
      type: 'APPEAL_DECIDED',
      relatedAppeal: appeal._id,
      channels: ['IN_APP', 'EMAIL'],
    });

    res.status(200).json({ success: true, message: 'Hearing scheduled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue decision on appeal (Section 19 & 20)
// @route   PUT /api/appellate/appeals/:id/decision
// @access  Appellate
const issueDecision = async (req, res) => {
  try {
    const { decision, decisionDetails, penaltyAmount, disciplinaryActionRecommended } = req.body;
    const appeal = await Appeal.findById(req.params.id).populate('citizen', 'name email').populate('rtiRequest');

    if (!appeal) return res.status(404).json({ success: false, message: 'Appeal not found.' });

    // Section 20: max penalty ₹25,000
    const finalPenalty = Math.min(penaltyAmount || 0, 25000);

    appeal.decision = decision;
    appeal.decisionDetails = decisionDetails;
    appeal.penaltyAmount = finalPenalty;
    appeal.disciplinaryActionRecommended = disciplinaryActionRecommended || false;
    appeal.decidedAt = new Date();
    appeal.decidedBy = req.user._id;
    appeal.status = 'DECIDED';
    appeal.statusHistory.push({ status: 'DECIDED', changedBy: req.user._id, note: `Decision: ${decision}` });

    await appeal.save();

    // If appeal upheld, update RTI request status
    if (decision === 'UPHELD' && appeal.rtiRequest) {
      await RTIRequest.findByIdAndUpdate(appeal.rtiRequest._id, { status: 'IN_PROGRESS' });
    }

    await Notification.create({
      user: appeal.citizen._id,
      title: 'Appeal Decision Issued',
      message: `Decision on your appeal ${appeal.appealId}: ${decision}. ${decisionDetails}`,
      type: 'APPEAL_DECIDED',
      relatedAppeal: appeal._id,
      channels: ['IN_APP', 'EMAIL'],
    });

    res.status(200).json({ success: true, message: 'Decision issued.', appeal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Appellate dashboard stats
// @route   GET /api/appellate/stats
// @access  Appellate
const getAppellateStats = async (req, res) => {
  try {
    const [total, filed, underReview, hearingScheduled, decided, dismissed] = await Promise.all([
      Appeal.countDocuments(),
      Appeal.countDocuments({ status: 'FILED' }),
      Appeal.countDocuments({ status: 'UNDER_REVIEW' }),
      Appeal.countDocuments({ status: 'HEARING_SCHEDULED' }),
      Appeal.countDocuments({ status: 'DECIDED' }),
      Appeal.countDocuments({ status: 'DISMISSED' }),
    ]);

    const decisionsBreakdown = await Appeal.aggregate([
      { $match: { status: 'DECIDED' } },
      { $group: { _id: '$decision', count: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, stats: { total, filed, underReview, hearingScheduled, decided, dismissed }, decisionsBreakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllAppeals, getAppealDetail, assignAppeal, scheduleHearing, issueDecision, getAppellateStats };
