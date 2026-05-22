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

// ── Socket.io Setup ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed =
        origin === 'http://localhost:3000' ||
        origin.endsWith('.vercel.app')     ||
        origin === process.env.FRONTEND_URL;
      if (allowed) callback(null, true);
      else callback(new Error('Socket CORS blocked'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store connected users — userId → socketId mapping
// So we can send notifications to specific users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User registers their userId with their socket
  // Called immediately after frontend connects
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
  });

  // Clean up when user disconnects
  socket.on('disconnect', () => {
    // Remove from map by value
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// ── Export io so controllers can send real-time notifications ──
// Usage: const { io, connectedUsers } = require('../index');
module.exports.io             = io;
module.exports.connectedUsers = connectedUsers;

// ── Global Error Handler ──────────────────────────────────────
// Catches any unhandled errors in routes
app.use((err, req, res, next) => {
  console.error(' Unhandled error:', err.message);

  // CORS error
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'CORS error — origin not allowed',
      origin:  req.headers.origin
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    error:   process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ── Handle 404 routes ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.path} not found` });
});