const express = require('express');
const { generateReceipt } = require('../controllers/receiptController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');
const {
  submitRTI, getMyRequests, trackRequest,
  fileAppeal, getMyAppeals, getNotifications, markNotificationRead
} = require('../controllers/citizenController');

router.use(protect, authorize('citizen'));

router.post('/rti', upload.array('attachments', 5), submitRTI);
router.get('/rti', getMyRequests);
router.get('/rti/:id/track', trackRequest);
router.post('/appeal', upload.array('attachments', 5), fileAppeal);
router.get('/appeals', getMyAppeals);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/rti/:id/receipt', protect, generateReceipt);
module.exports = router;
