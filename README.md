# Buzzboard — Project P1

A message board web application built with **Node.js + Express + MongoDB**, implementing the **MVC**, **Observer**, and **Singleton** design patterns.

---

## Features

| Task | Description | Status |
|------|-------------|--------|
| T1   | System maintains topics (message threads) | ✅ |
| T2.1 | On login, show 2 most recent messages per subscribed topic | ✅ |
| T2.2 | Link to browse all topics + Unsubscribe button per topic | ✅ |
| T3   | User can start a new topic (auto-subscribed) | ✅ |
| T4   | User can post a message in a subscribed topic | ✅ |
| T5   | MVC architecture pattern | ✅ |
| T6   | Observer pattern | ✅ |
| T7   | Singleton pattern for database access | ✅ |
| T8   | Stats route: number of times each topic was accessed | ✅ |

---

## Design Patterns

### MVC (T5)
| Layer | Location | Description |
|-------|----------|-------------|
| **Models** | `models/` | `User.js`, `Topic.js`, `Message.js` (Mongoose schemas) |
| **Views** | `views/` | Handlebars templates: dashboard, topics, stats, auth |
| **Controllers** | `controllers/` | `authController`, `topicController`, `messageController`, `statsController` |

### Observer Pattern (T6)
- **`Observable`** (`observers/Observable.js`) — base Subject class with `addObserver`, `removeObserver`, `notify`
- **`TopicService`** (`observers/TopicService.js`) — concrete Subject; fires `TOPIC_ACCESSED` and `MESSAGE_POSTED` events
- **`TopicObserver`** (`observers/TopicObserver.js`) — concrete Observer; reacts by incrementing `accessCount` / `messageCount` in MongoDB

Every time a topic page is loaded, `topicService.topicAccessed(id)` is called → the Observer increments the counter → visible on `/stats`.

### Singleton Pattern (T7)
- **`Database`** (`config/database.js`) — only one instance is ever created via `Database.getInstance()`
- `server.js` boots by calling `db.connect()` once; all subsequent calls to `getInstance()` return the same object

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 4
- **Database**: MongoDB (via Mongoose)
- **Templates**: express-handlebars
- **Auth**: express-session + bcryptjs
- **Session Store**: connect-mongo
- **Hosting**: Render.com (Node) + MongoDB Atlas

---

## Local Setup

### Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### Steps

```bash
# 1. Clone / extract the project
cd messageboard

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in your MONGODB_URI and SESSION_SECRET

# 4. Start the development server
npm run dev
# → http://localhost:3000
```

---

## Environment Variables (`.env`)

```
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/messageboard
SESSION_SECRET=some_long_random_string
NODE_ENV=development
```

---

## Deploying to Render.com

1. Push code to a GitHub repo
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables (MONGODB_URI, SESSION_SECRET, NODE_ENV=production)
6. Deploy — Render gives you a public URL

---

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Redirect → dashboard or login |
| GET | `/auth/register` | Register page |
| POST | `/auth/register` | Create account |
| GET | `/auth/login` | Login page |
| POST | `/auth/login` | Authenticate |
| GET | `/auth/logout` | Logout |
| GET | `/dashboard` | Home after login (T2.1 + T2.2) |
| GET | `/topics` | Browse all topics (T2.2) |
| GET | `/topics/new` | New topic form (T3) |
| POST | `/topics` | Create topic (T3) |
| GET | `/topics/:id` | View topic + messages (T4, T8) |
| POST | `/topics/:id/subscribe` | Subscribe to topic |
| POST | `/topics/:id/unsubscribe` | Unsubscribe from topic (T2.2) |
| POST | `/topics/:id/messages` | Post a message (T4) |
| GET | `/stats` | Topic access statistics (T8) |
| GET | `/api/stats` | JSON stats endpoint (T8) |

---

## Project Structure

```
messageboard/
├── server.js                  # Entry point
├── config/
│   └── database.js            # Singleton DB connection
├── models/
│   ├── User.js                # MVC Model
│   ├── Topic.js               # MVC Model
│   └── Message.js             # MVC Model
├── controllers/
│   ├── authController.js      # MVC Controller
│   ├── topicController.js     # MVC Controller (T2.1, T2.2, T3, T4)
│   ├── messageController.js   # MVC Controller (T4)
│   └── statsController.js     # MVC Controller (T8)
├── routes/
│   ├── authRoutes.js
│   ├── topicRoutes.js
│   └── statsRoutes.js
├── observers/
│   ├── Observable.js          # Observer base (Subject)
│   ├── TopicObserver.js       # Observer (T6)
│   └── TopicService.js        # Concrete Subject (T6)
├── middleware/
│   └── auth.js                # requireAuth, redirectIfAuth, attachUser
├── views/                     # MVC Views (Handlebars)
│   ├── layouts/main.handlebars
│   ├── auth/{login,register}.handlebars
│   ├── topics/{index,show,new}.handlebars
│   ├── dashboard.handlebars
│   ├── stats.handlebars
│   └── error.handlebars
└── public/
    └── css/style.css
```
