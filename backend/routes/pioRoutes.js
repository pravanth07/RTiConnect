const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');
const { getAssignedRequests, getRequestDetail, respondToRequest, rejectRequest, transferRequest, requestAdditionalFee, getPIOStats } = require('../controllers/pioController');

router.use(protect, authorize('pio'));

router.get('/stats', getPIOStats);
router.get('/requests', getAssignedRequests);
router.get('/requests/:id', getRequestDetail);
router.put('/requests/:id/respond', upload.array('responseDocuments', 5), respondToRequest);
router.put('/requests/:id/reject', rejectRequest);
router.put('/requests/:id/transfer', transferRequest);
router.put('/requests/:id/request-fee', requestAdditionalFee);

module.exports = router;
