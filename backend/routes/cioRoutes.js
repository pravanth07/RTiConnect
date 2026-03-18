const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getDashboard, getAllRequests, assignToPIO, getAllPIOs, createPIO, togglePIOStatus, getReports } = require('../controllers/cioController');

router.use(protect, authorize('cio'));

router.get('/dashboard', getDashboard);
router.get('/requests', getAllRequests);
router.put('/assign/:requestId', assignToPIO);
router.get('/pio', getAllPIOs);
router.post('/pio', createPIO);
router.put('/pio/:id/toggle', togglePIOStatus);
router.get('/reports', getReports);

module.exports = router;
