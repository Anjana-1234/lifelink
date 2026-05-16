const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const { expireOldRequests, unlockEligibleDonors } = require('./utils/cronJobs');
const { verifyEmailConfig }                        = require('./utils/sendEmail');

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Allow any vercel.app URL + localhost
    const allowed = [
      'http://localhost:3000',
      'https://lifelink-dun-seven.vercel.app',
      'https://lifelink-8vxummgkq-anjana-1234s-projects.vercel.app',
      process.env.FRONTEND_URL
    ];

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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