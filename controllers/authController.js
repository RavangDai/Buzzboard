const User = require('../models/User');
const Topic = require('../models/Topic');

const authController = {
  // GET /auth/register
  getRegister(req, res) {
    res.render('auth/register', { title: 'Create Account' });
  },

  // POST /auth/register
  async postRegister(req, res) {
    const { username, email, password, confirmPassword } = req.body;
    const errors = [];

    if (!username || !email || !password || !confirmPassword) {
      errors.push('All fields are required.');
    }
    if (password !== confirmPassword) {
      errors.push('Passwords do not match.');
    }
    if (password && password.length < 6) {
      errors.push('Password must be at least 6 characters.');
    }

    if (errors.length) {
      return res.render('auth/register', { title: 'Create Account', errors, username, email });
    }

    try {
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) {
        errors.push('An account with that email or username already exists.');
        return res.render('auth/register', { title: 'Create Account', errors, username, email });
      }

      const user = await User.create({ username, email, password });
      req.session.userId = user._id;
      req.session.username = user.username;
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      res.render('auth/register', {
        title: 'Create Account',
        errors: ['Registration failed. Please try again.'],
        username,
        email,
      });
    }
  },

  // GET /auth/login
  getLogin(req, res) {
    res.render('auth/login', { title: 'Sign In' });
  },

  // POST /auth/login
  async postLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('auth/login', {
        title: 'Sign In',
        errors: ['Email and password are required.'],
        email,
      });
    }

    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.render('auth/login', {
          title: 'Sign In',
          errors: ['Invalid email or password.'],
          email,
        });
      }

      req.session.userId = user._id;
      req.session.username = user.username;

      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    } catch (err) {
      console.error(err);
      res.render('auth/login', {
        title: 'Sign In',
        errors: ['Login failed. Please try again.'],
        email,
      });
    }
  },

  // GET /auth/logout
  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  },
};

module.exports = authController;
