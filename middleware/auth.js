/**
 * Middleware: protect routes that require authentication.
 */
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};

/**
 * Middleware: redirect logged-in users away from auth pages.
 */
const redirectIfAuth = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

/**
 * Middleware: attach current user info to res.locals for views.
 */
const attachUser = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.session.userId).select('-password');
      res.locals.currentUser = user;
      res.locals.isLoggedIn = true;
    } catch (err) {
      res.locals.currentUser = null;
      res.locals.isLoggedIn = false;
    }
  } else {
    res.locals.currentUser = null;
    res.locals.isLoggedIn = false;
  }
  next();
};

module.exports = { requireAuth, redirectIfAuth, attachUser };
