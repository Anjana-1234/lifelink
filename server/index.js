const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { expireOldRequests, unlockEligibleDonors } = require('./utils/cronJobs');
const { verifyEmailConfig } = require('./utils/sendEmail');

const app    = express();
const server = http.createServer(app);

// ── Connected users map ───────────────────────────────────────
// userId → socketId — lets us find any user's socket
const connectedUsers = new Map();

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed =
      origin === 'http://localhost:3000'  ||
      origin === 'http://localhost:3001'  ||
      origin.endsWith('.vercel.app')      ||
      origin === process.env.FRONTEND_URL;
    if (allowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ── Socket.io ─────────────────────────────────────────────────
// Must be set up BEFORE routes so controllers can import it
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
    methods:     ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(' Socket connected:', socket.id);

  // Frontend calls this right after connecting
  // Saves userId → socketId so we can find them later
  socket.on('register', (userId) => {
    connectedUsers.set(userId.toString(), socket.id);
    console.log(` User ${userId} registered → socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    // Remove disconnected user from map
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

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
app.use('/api/feedback',      require('./routes/feedback'));
app.use('/api/reports',       require('./routes/report'));
app.use('/api/otp',           require('./routes/otp'));

// ── Health check route ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🩸 LifeLink API is running',
    version: '1.0.0',
    status:  'healthy'
  });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'CORS error — origin not allowed',
      origin:  req.headers.origin
    });
  }
  res.status(500).json({
    message: 'Internal server error',
    error:   process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong'
  });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.path} not found` });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ── Single export — all at once ───────────────────────────────
// Controllers import these to send real-time notifications
module.exports = { app, server, io, connectedUsers };