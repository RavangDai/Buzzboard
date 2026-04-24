const Message = require('../models/Message');
const User = require('../models/User');
const topicService = require('../observers/TopicService'); // Observer subject

const messageController = {
  // POST /topics/:id/messages — Post a message in a subscribed topic (T4)
  async postMessage(req, res) {
    const { content } = req.body;
    const topicId = req.params.id;
    const errors = [];

    if (!content || content.trim().length === 0) {
      errors.push('Message content cannot be empty.');
    }
    if (content && content.trim().length > 1000) {
      errors.push('Message cannot exceed 1000 characters.');
    }

    if (errors.length) {
      // Re-render the topic page with errors
      return res.redirect(`/topics/${topicId}?error=${encodeURIComponent(errors[0])}`);
    }

    try {
      // Verify user is subscribed before posting (T4)
      const user = await User.findById(req.session.userId);
      const isSubscribed = user.subscriptions.some(
        id => id.toString() === topicId
      );

      if (!isSubscribed) {
        return res.redirect(`/topics/${topicId}?error=You must be subscribed to post in this topic.`);
      }

      await Message.create({
        content: content.trim(),
        author: req.session.userId,
        topic: topicId,
      });

      // Observer: notify that a message was posted
      topicService.messagePosted(topicId);

      res.redirect(`/topics/${topicId}`);
    } catch (err) {
      console.error(err);
      res.redirect(`/topics/${topicId}?error=Could not post message.`);
    }
  },
};

module.exports = messageController;
