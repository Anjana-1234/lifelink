const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const { expireOldRequests, unlockEligibleDonors } = require('./utils/cronJobs');
const { verifyEmailConfig }                        = require('./utils/sendEmail');

const app = express();

// ── CORS — allow both local and production frontend ───────────
// This is critical — without correct CORS, frontend can't call backend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://lifelink-git-main-anjana-1234s-projects.vercel.app',
    'https://lifelink-8vxummgkq-anjana-1234s-projects.vercel.app',
    process.env.FRONTEND_URL  // from Railway environment variables
  ],
  credentials: true
}));

app.use(express.json());

// ── Database ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await verifyEmailConfig();
    expireOldRequests();
    unlockEligibleDonors();
  })
  .catch(err => console.log('❌ MongoDB error:', err));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/donors',        require('./routes/donor'));
app.use('/api/requests',      require('./routes/request'));
app.use('/api/notifications', require('./routes/notification'));

// ── Test Route ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🩸 LifeLink API is running' });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});