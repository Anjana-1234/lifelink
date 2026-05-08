const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const { verifyEmailConfig } = require('./utils/sendEmail');
require('dotenv').config();

// ── Import Cron Jobs ──────────────────────────────────────────
// These run automatically in the background after server starts
const { expireOldRequests, unlockEligibleDonors } = require('./utils/cronJobs');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json()); // parse incoming JSON request bodies
app.use(cors());         // allow frontend (localhost:3000) to call this API

// ── Database Connection ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    // Start cron jobs AFTER DB is connected
    // Important: cron jobs use DB, so DB must be ready first
    expireOldRequests();    // runs every hour — expires 48h old requests
    unlockEligibleDonors(); // runs every midnight — unlocks donors after 56 days
  })
  .catch(err => console.log('❌ MongoDB error:', err));

  mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Verify email is working on startup — same as Orato does
    await verifyEmailConfig();

    expireOldRequests();
    unlockEligibleDonors();
  })
  .catch(err => console.log('❌ MongoDB error:', err));

// ── Routes ────────────────────────────────────────────────────
// Each route file handles a specific feature
// The prefix here + the path in route file = full URL
// Example: '/api/auth' + '/login' = '/api/auth/login'

app.use('/api/auth',     require('./routes/auth'));     // register, login, getMe
app.use('/api/donors',   require('./routes/donor'));    // donor profile routes
app.use('/api/requests', require('./routes/request')); // blood request routes
app.use('/api/notifications', require('./routes/notification'));

// ── Test Route ────────────────────────────────────────────────
// Visit http://localhost:5000 to confirm API is running
app.get('/', (req, res) => {
  res.json({ message: '🩸 LifeLink API is running' });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});