const RTIRequest = require('../models/RTIRequest');
const User = require('../models/User');
const { Notification } = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { getDaysRemaining, getDeadlineStatus } = require('../utils/deadlineCalculator');

// @desc    CIO dashboard overview stats
// @route   GET /api/cio/dashboard
// @access  CIO
const getDashboard = async (req, res) => {
  try {
    const [
      totalRequests, submitted, assigned, inProgress,
      responded, rejected, overdue, totalAppeals,
      totalPIOs, activePIOs
    ] = await Promise.all([
      RTIRequest.countDocuments(),
      RTIRequest.countDocuments({ status: 'SUBMITTED' }),
      RTIRequest.countDocuments({ status: 'ASSIGNED' }),
      RTIRequest.countDocuments({ status: 'IN_PROGRESS' }),
      RTIRequest.countDocuments({ status: 'RESPONDED' }),
      RTIRequest.countDocuments({ status: 'REJECTED' }),
      RTIRequest.countDocuments({ responseDeadline: { $lt: new Date() }, status: { $nin: ['RESPONDED', 'CLOSED', 'REJECTED'] } }),
      require('../models/Appeal').countDocuments(),
      User.countDocuments({ role: 'pio' }),
      User.countDocuments({ role: 'pio', isActive: true }),
    ]);

    // Department-wise breakdown
    const deptStats = await RTIRequest.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 }, responded: { $sum: { $cond: [{ $eq: ['$status', 'RESPONDED'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await RTIRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: { totalRequests, submitted, assigned, inProgress, responded, rejected, overdue, totalAppeals, totalPIOs, activePIOs },
      deptStats,
      monthlyTrend,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all RTI requests
// @route   GET /api/cio/requests
// @access  CIO
const getAllRequests = async (req, res) => {
  try {
    const { status, department, page = 1, limit = 15, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) query.$or = [
      { requestId: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];

    const requests = await RTIRequest.find(query)
      .populate('citizen', 'name email phone')
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

// @desc    Assign request to PIO
// @route   PUT /api/cio/assign/:requestId
// @access  CIO
const assignToPIO = async (req, res) => {
  try {
    const { pioId } = req.body;
    const request = await RTIRequest.findById(req.params.requestId).populate('citizen', 'name email');
    const pio = await User.findOne({ _id: pioId, role: 'pio', isActive: true });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (!pio) return res.status(404).json({ success: false, message: 'PIO not found or inactive.' });

    request.assignedPIO = pioId;
    request.assignedBy = req.user._id;
    request.assignedAt = new Date();
    request.status = 'ASSIGNED';
    request.statusHistory.push({ status: 'ASSIGNED', changedBy: req.user._id, note: `Assigned to PIO: ${pio.name}` });

    await request.save();

    await sendEmail({
      to: pio.email,
      template: 'requestAssigned',
      data: [pio.name, request.requestId, request.citizen.name, request.responseDeadline],
    });

    await Notification.create({
      user: pioId,
      title: 'New RTI Request Assigned',
      message: `Request ${request.requestId} has been assigned to you. Deadline: ${new Date(request.responseDeadline).toLocaleDateString('en-IN')}`,
      type: 'REQUEST_ASSIGNED',
      relatedRequest: request._id,
      channels: ['IN_APP', 'EMAIL'],
    });

    res.status(200).json({ success: true, message: `Request assigned to ${pio.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all PIOs
// @route   GET /api/cio/pio
// @access  CIO
const getAllPIOs = async (req, res) => {
  try {
    const pios = await User.find({ role: 'pio' }).select('-password');

    // Enrich with workload
    const enriched = await Promise.all(pios.map(async (pio) => {
      const activeCount = await RTIRequest.countDocuments({ assignedPIO: pio._id, status: { $in: ['ASSIGNED', 'IN_PROGRESS'] } });
      const overdueCount = await RTIRequest.countDocuments({ assignedPIO: pio._id, responseDeadline: { $lt: new Date() }, status: { $nin: ['RESPONDED', 'CLOSED', 'REJECTED'] } });
      return { ...pio.toObject(), activeRequests: activeCount, overdueRequests: overdueCount };
    }));

    res.status(200).json({ success: true, pios: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a PIO account
// @route   POST /api/cio/pio
// @access  CIO
const createPIO = async (req, res) => {
  try {
    const { name, email, password, phone, department, designation } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists.' });

    const pio = await User.create({ name, email, password, phone, department, designation, role: 'pio' });

    res.status(201).json({ success: true, message: 'PIO account created.', pio: { _id: pio._id, name: pio.name, email: pio.email, department: pio.department } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle PIO active/inactive
// @route   PUT /api/cio/pio/:id/toggle
// @access  CIO
const togglePIOStatus = async (req, res) => {
  try {
    const pio = await User.findOne({ _id: req.params.id, role: 'pio' });
    if (!pio) return res.status(404).json({ success: false, message: 'PIO not found.' });

    pio.isActive = !pio.isActive;
    await pio.save();

    res.status(200).json({ success: true, message: `PIO ${pio.isActive ? 'activated' : 'deactivated'}.`, isActive: pio.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate report
// @route   GET /api/cio/reports
// @access  CIO
const getReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const query = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const [statusBreakdown, deptBreakdown, pioPerformance] = await Promise.all([
      RTIRequest.aggregate([{ $match: query }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      RTIRequest.aggregate([{ $match: query }, { $group: { _id: '$department', total: { $sum: 1 }, responded: { $sum: { $cond: [{ $eq: ['$status', 'RESPONDED'] }, 1, 0] } } } }]),
      RTIRequest.aggregate([
        { $match: { ...query, assignedPIO: { $exists: true } } },
        { $group: { _id: '$assignedPIO', total: { $sum: 1 }, responded: { $sum: { $cond: [{ $eq: ['$status', 'RESPONDED'] }, 1, 0] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'pio' } },
        { $unwind: '$pio' },
        { $project: { pioName: '$pio.name', total: 1, responded: 1, responseRate: { $divide: ['$responded', '$total'] } } },
      ]),
    ]);

    res.status(200).json({ success: true, statusBreakdown, deptBreakdown, pioPerformance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getAllRequests, assignToPIO, getAllPIOs, createPIO, togglePIOStatus, getReports };
