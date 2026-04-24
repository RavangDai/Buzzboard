require('dotenv').config();

const express         = require('express');
const { engine }      = require('express-handlebars');
const session         = require('express-session');
const MongoStore      = require('connect-mongo');
const path            = require('path');

// ── Singleton DB ────────────────────────────────────────────────────────────
const Database = require('./config/database');

// ── Routes ──────────────────────────────────────────────────────────────────
const authRoutes  = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const statsRoutes = require('./routes/statsRoutes');

// ── Middleware ───────────────────────────────────────────────────────────────
const { attachUser } = require('./middleware/auth');

const app = express();

// ── Handlebars (View Engine — MVC "V") ──────────────────────────────────────
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    // Format a JS Date into a readable string
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr  = Math.floor(diffMs / 3600000);
      const diffDay = Math.floor(diffMs / 86400000);
      if (diffMin < 1)  return 'just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr  < 24) return `${diffHr}h ago`;
      if (diffDay < 7)  return `${diffDay}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    // First letter of a string (for avatar)
    firstLetter(str) {
      return str ? str.charAt(0).toUpperCase() : '?';
    },
    // 1-based index for stats table
    addOne(index) {
      return index + 1;
    },
    // Width % for the access-count bar in stats
    accessPercent(topic, topics) {
      const max = Math.max(...topics.map(t => t.accessCount), 1);
      return Math.round((topic.accessCount / max) * 100);
    },
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Sessions ─────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
}));

// ── Attach current user to all views ─────────────────────────────────────────
app.use(attachUser);

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect(req.session.userId ? '/dashboard' : '/auth/login');
});

app.use('/auth',  authRoutes);
app.use('/',      topicRoutes);
app.use('/',      statsRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', { title: '404 Not Found', message: 'Page not found.' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Server Error', message: 'Something went wrong.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

(async () => {
  const db = Database.getInstance(); // Singleton
  await db.connect();
  app.listen(PORT, () => {
    console.log(`\n✅  Server running on http://localhost:${PORT}`);
    console.log(`   DB Singleton instance: ${db === Database.getInstance() ? 'confirmed' : 'ERROR'}\n`);
  });
})();
