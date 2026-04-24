const Topic = require('../models/Topic');

const statsController = {
  // GET /stats — Show access statistics for all topics (T8)
  async getStats(req, res) {
    try {
      const topics = await Topic.find()
        .sort({ accessCount: -1 })
        .populate('creator', 'username');

      const totalAccesses = topics.reduce((sum, t) => sum + t.accessCount, 0);
      const totalMessages = topics.reduce((sum, t) => sum + t.messageCount, 0);

      res.render('stats', {
        title: 'Topic Statistics',
        topics,
        totalAccesses,
        totalMessages,
        topicCount: topics.length,
      });
    } catch (err) {
      console.error(err);
      res.render('error', { title: 'Error', message: 'Could not load statistics.' });
    }
  },

  // GET /api/stats — JSON version for testing/API access (T8)
  async getStatsJson(req, res) {
    try {
      const topics = await Topic.find()
        .sort({ accessCount: -1 })
        .populate('creator', 'username')
        .lean();

      const stats = topics.map(t => ({
        id: t._id,
        title: t.title,
        accessCount: t.accessCount,
        messageCount: t.messageCount,
        createdBy: t.creator ? t.creator.username : 'unknown',
        createdAt: t.createdAt,
      }));

      res.json({
        success: true,
        totalTopics: topics.length,
        totalAccesses: stats.reduce((s, t) => s + t.accessCount, 0),
        totalMessages: stats.reduce((s, t) => s + t.messageCount, 0),
        topics: stats,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = statsController;
