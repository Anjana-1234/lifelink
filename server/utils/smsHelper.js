const twilio = require('twilio');

// ── Twilio Client ─────────────────────────────────────────────
// Initialize with credentials from environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── Format Sri Lanka phone number ─────────────────────────────
// Converts 0771234567 → +94771234567
// Handles numbers already in +94 format
const formatSriLankaPhone = (phone) => {
  // Remove all spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');

  // Already in international format
  if (cleaned.startsWith('+94')) return cleaned;

  // Starts with 94 (no plus)
  if (cleaned.startsWith('94')) return '+' + cleaned;

  // Starts with 0 (local format) → replace with +94
  if (cleaned.startsWith('0')) return '+94' + cleaned.slice(1);

  // Assume local number without leading 0
  return '+94' + cleaned;
};

// ── Generate 6-digit OTP ──────────────────────────────────────
const generateOTP = () => {
  // Random 6-digit number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── Send OTP SMS ──────────────────────────────────────────────
const sendOTP = async (phone, otp) => {
  try {
    const formattedPhone = formatSriLankaPhone(phone);

    const message = await client.messages.create({
      body: `Your LifeLink verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.\n- LifeLink Team`,
      from: process.env.TWILIO_PHONE,
      to:   formattedPhone
    });

    console.log(
      `📱 OTP SMS sent to ${formattedPhone} — SID: ${message.sid}`
    );
    return { success: true, sid: message.sid };

  } catch (error) {
    console.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTP, generateOTP, formatSriLankaPhone };