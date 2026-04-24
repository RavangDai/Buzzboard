const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAuth } = require('../middleware/auth');

router.get('/stats', requireAuth, statsController.getStats);
router.get('/api/stats', statsController.getStatsJson); // public JSON endpoint

module.exports = router;
