const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { expireOldRequests, unlockEligibleDonors } = require('./utils/cronJobs');
const { verifyEmailConfig }                        = require('./utils/sendEmail');

const app    = express();
const server = http.createServer(app); // ← needed for Socket.io later

// ── CORS ──────────────────────────────────────────────────────
// Allows ALL vercel.app URLs + localhost
// So any new Vercel deployment works automatically
app.use(cors({
  origin: function(origin, callback) {

    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    const allowed =
      origin === 'http://localhost:3000'     ||  // local dev
      origin === 'http://localhost:3001'     ||  // local dev alt port
      origin.endsWith('.vercel.app')         ||  // ANY vercel deployment
      origin === process.env.FRONTEND_URL;       // Railway env variable

    if (allowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  res.json({
    message: '🩸 LifeLink API is running',
    version: '1.0.0',
    status:  'healthy'
  });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export server for Socket.io (used in Fix 3)
module.exports = { app, server };