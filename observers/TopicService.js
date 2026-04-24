const Observable = require('./Observable');
const TopicObserver = require('./TopicObserver');

/**
 * TopicService - Concrete Subject (Observable)
 * Fires events when topics are accessed or messages are posted.
 * Registered observers (e.g. TopicObserver) react to these events.
 */
class TopicService extends Observable {
  constructor() {
    super();
    // Register the TopicObserver automatically
    this.addObserver(new TopicObserver());
  }

  topicAccessed(topicId) {
    this.notify('TOPIC_ACCESSED', { topicId });
  }

  messagePosted(topicId) {
    this.notify('MESSAGE_POSTED', { topicId });
  }
}

// Export a single shared instance (also acts as a Singleton service)
module.exports = new TopicService();
