// ── Socket helper ─────────────────────────────────────────────
// Shared utility so both requestController and feedbackController
// can send real-time notifications without circular imports
const emitToUser = (userId, notification) => {
  try {
    const { io, connectedUsers } = require('../index');
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('new_notification', notification);
      console.log(` Real-time notification sent to user ${userId}`);
    } else {
      console.log(` User ${userId} offline — notification saved to DB`);
    }
  } catch (err) {
    // Never crash main flow because of socket error
    console.error('Socket emit error (non-fatal):', err.message);
  }
};

module.exports = { emitToUser };