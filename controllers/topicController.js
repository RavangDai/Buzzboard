const Topic = require('../models/Topic');
const Message = require('../models/Message');
const User = require('../models/User');
const topicService = require('../observers/TopicService'); // Observer subject

const topicController = {

  // GET /dashboard  — T2.1 + T2.2
  async getDashboard(req, res) {
    try {
      const user = await User.findById(req.session.userId).populate('subscriptions');

      // T2.1: For each subscribed topic, fetch the 2 most recent messages
      const topicsWithMessages = await Promise.all(
        user.subscriptions.map(async (topic) => {
          const messages = await Message.find({ topic: topic._id })
            .sort({ createdAt: -1 })
            .limit(2)
            .populate('author', 'username');
          return {
            _id: topic._id,
            title: topic.title,
            description: topic.description,
            messages: messages.reverse(), // show oldest-first within the 2
          };
        })
      );

      res.render('dashboard', {
        title: 'My Dashboard',
        topics: topicsWithMessages,
      });
    } catch (err) {
      console.error(err);
      res.render('error', { title: 'Error', message: 'Could not load dashboard.' });
    }
  },

  // GET /topics — Browse all topics for subscription (T2.2)
  async getAllTopics(req, res) {
    try {
      const user = await User.findById(req.session.userId);
      const allTopics = await Topic.find().sort({ createdAt: -1 }).populate('creator', 'username');

      const subscribedIds = user.subscriptions.map(id => id.toString());

      const topics = allTopics.map(topic => ({
        _id: topic._id,
        title: topic.title,
        description: topic.description,
        creator: topic.creator,
        accessCount: topic.accessCount,
        messageCount: topic.messageCount,
        createdAt: topic.createdAt,
        isSubscribed: subscribedIds.includes(topic._id.toString()),
      }));

      res.render('topics/index', { title: 'All Topics', topics });
    } catch (err) {
      console.error(err);
      res.render('error', { title: 'Error', message: 'Could not load topics.' });
    }
  },

  // GET /topics/new — Form to create topic (T3)
  getNewTopic(req, res) {
    res.render('topics/new', { title: 'Start a New Topic' });
  },

  // POST /topics — Create topic + auto-subscribe (T3)
  async postNewTopic(req, res) {
    const { title, description } = req.body;
    const errors = [];

    if (!title || title.trim().length < 3) {
      errors.push('Title must be at least 3 characters.');
    }

    if (errors.length) {
      return res.render('topics/new', { title: 'Start a New Topic', errors, formTitle: title, description });
    }

    try {
      const topic = await Topic.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        creator: req.session.userId,
      });

      // Auto-subscribe creator to their new topic (T3)
      await User.findByIdAndUpdate(req.session.userId, {
        $addToSet: { subscriptions: topic._id },
      });

      res.redirect(`/topics/${topic._id}`);
    } catch (err) {
      console.error(err);
      res.render('topics/new', {
        title: 'Start a New Topic',
        errors: ['Could not create topic. Please try again.'],
        formTitle: title,
        description,
      });
    }
  },

  // GET /topics/:id — View a topic and its messages (T4)
  // Also fires the Observer to increment accessCount (T8)
  async getTopicById(req, res) {
    try {
      const topic = await Topic.findById(req.params.id).populate('creator', 'username');
      if (!topic) {
        return res.render('error', { title: 'Not Found', message: 'Topic not found.' });
      }

      // Observer Pattern: notify TopicObserver to increment access count (T8)
      topicService.topicAccessed(topic._id);

      const messages = await Message.find({ topic: topic._id })
        .sort({ createdAt: 1 })
        .populate('author', 'username');

      const user = await User.findById(req.session.userId);
      const isSubscribed = user.subscriptions.some(
        id => id.toString() === topic._id.toString()
      );

      res.render('topics/show', {
        title: topic.title,
        topic,
        messages,
        isSubscribed,
      });
    } catch (err) {
      console.error(err);
      res.render('error', { title: 'Error', message: 'Could not load topic.' });
    }
  },

  // POST /topics/:id/subscribe — Subscribe to a topic (T2.2)
  async subscribe(req, res) {
    try {
      await User.findByIdAndUpdate(req.session.userId, {
        $addToSet: { subscriptions: req.params.id },
      });
      const returnTo = req.body.returnTo || '/topics';
      res.redirect(returnTo);
    } catch (err) {
      console.error(err);
      res.redirect('/topics');
    }
  },

  // POST /topics/:id/unsubscribe — Unsubscribe from a topic (T2.2)
  async unsubscribe(req, res) {
    try {
      await User.findByIdAndUpdate(req.session.userId, {
        $pull: { subscriptions: req.params.id },
      });
      const returnTo = req.body.returnTo || '/dashboard';
      res.redirect(returnTo);
    } catch (err) {
      console.error(err);
      res.redirect('/dashboard');
    }
  },
};

module.exports = topicController;
