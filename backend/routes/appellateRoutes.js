const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAllAppeals, getAppealDetail, assignAppeal, scheduleHearing, issueDecision, getAppellateStats } = require('../controllers/appellateController');

router.use(protect, authorize('appellate'));

router.get('/stats', getAppellateStats);
router.get('/appeals', getAllAppeals);
router.get('/appeals/:id', getAppealDetail);
router.put('/appeals/:id/assign', assignAppeal);
router.post('/hearing', scheduleHearing);
router.put('/appeals/:id/decision', issueDecision);

module.exports = router;
