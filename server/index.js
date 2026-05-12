const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

// ── Utilities ─────────────────────────────────────────────────
const { expireOldRequests, unlockEligibleDonors } = require('./utils/cronJobs');
const { verifyEmailConfig } = require('./utils/sendEmail');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());

// Allow requests from both localhost and production frontend
app.use(cors({
  origin: [
    'http://localhost:3000',                   // local development
    process.env.FRONTEND_URL,                  // production Vercel URL
  ],
  credentials: true
}));

// ── Database Connection ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Verify email is working on startup
    // If this fails, check EMAIL_USER and EMAIL_PASS in .env
    await verifyEmailConfig();

    // Start background cron jobs
    expireOldRequests();    // auto-expire requests after 48 hours
    unlockEligibleDonors(); // unlock donors after 56-day cooldown
  })
  .catch(err => console.log('❌ MongoDB error:', err));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/donors',        require('./routes/donor'));
app.use('/api/requests',      require('./routes/request'));
app.use('/api/notifications', require('./routes/notification')); // 👈 new

// ── Test Route ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🩸 LifeLink API is running' });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});