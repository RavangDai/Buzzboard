/**
 * TopicObserver - Observer Pattern
 * Listens for topic events and updates statistics accordingly (T8).
 */
class TopicObserver {
  /**
   * Called by Observable.notify()
   * @param {string} eventType
   * @param {Object} data
   */
  async update(eventType, data) {
    if (eventType === 'TOPIC_ACCESSED') {
      await this._handleTopicAccessed(data.topicId);
    } else if (eventType === 'MESSAGE_POSTED') {
      await this._handleMessagePosted(data.topicId);
    }
  }

  async _handleTopicAccessed(topicId) {
    const Topic = require('../models/Topic');
    try {
      await Topic.findByIdAndUpdate(topicId, { $inc: { accessCount: 1 } });
    } catch (err) {
      console.error('TopicObserver: Error incrementing access count:', err.message);
    }
  }

  async _handleMessagePosted(topicId) {
    const Topic = require('../models/Topic');
    try {
      await Topic.findByIdAndUpdate(topicId, { $inc: { messageCount: 1 } });
    } catch (err) {
      console.error('TopicObserver: Error incrementing message count:', err.message);
    }
  }
}

module.exports = TopicObserver;
