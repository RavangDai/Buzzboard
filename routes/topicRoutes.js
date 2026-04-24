const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

// Dashboard (T2.1, T2.2)
router.get('/dashboard', requireAuth, topicController.getDashboard);

// Topic routes
router.get('/topics', requireAuth, topicController.getAllTopics);
router.get('/topics/new', requireAuth, topicController.getNewTopic);       // T3
router.post('/topics', requireAuth, topicController.postNewTopic);          // T3
router.get('/topics/:id', requireAuth, topicController.getTopicById);       // T4 + T8 (Observer fires)
router.post('/topics/:id/subscribe', requireAuth, topicController.subscribe);     // T2.2
router.post('/topics/:id/unsubscribe', requireAuth, topicController.unsubscribe); // T2.2

// Message routes (T4)
router.post('/topics/:id/messages', requireAuth, messageController.postMessage);

module.exports = router;
