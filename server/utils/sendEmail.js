const nodemailer = require('nodemailer');

// ── One fixed transporter for the whole LifeLink app ─────────
// This is LifeLink's own Gmail account that sends all emails
// Users register with their OWN emails — we just send TO them
// They never need to provide any password or app credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // alertslifelink@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail App Password for above account
  }
});

// ── Verify email config on server start ──────────────────────

const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready');
    return true;
  } catch (error) {
    console.error('❌ Email config error:', error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────
// Send blood request notification to a matching donor
//
// FROM: alertslifelink@gmail.com (our app's fixed email)
// TO:   donor's personal email (stored in DB from registration)
//
// one sender, many different recipients
// ─────────────────────────────────────────────────────────────
const sendDonorNotification = async ({ donorEmail, donorName, request }) => {
  if (!donorEmail) {
    console.log('⚠️ No donor email, skipping...');
    return false;
  }

  try {
    const { bloodType, hospital, location, urgency } = request;

    const urgencyEmoji = {
      Critical: '🚨',
      Urgent:   '⚠️',
      Normal:   '💙'
    }[urgency] || '🩸';

    const mailOptions = {
      from:    `"LifeLink 🩸" <${process.env.EMAIL_USER}>`,
      to:      donorEmail, // donor's personal email from DB
      subject: `${urgencyEmoji} ${urgency} — ${bloodType} blood needed in ${location.district}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px;
                         background-color: #f9f9f9; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #1B2A4A 0%, #C0171D 100%);
                      color: white; padding: 30px; text-align: center;
                      border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px;
                       border-radius: 0 0 10px 10px; }
            .request-box { background: #FFF5F5; border-left: 4px solid #C0171D;
                           border-radius: 8px; padding: 16px; margin: 20px 0; }
            .button { display: inline-block; background: #C0171D; color: white;
                      padding: 14px 36px; text-decoration: none; border-radius: 10px;
                      font-weight: bold; font-size: 15px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px;
                      color: rgba(255,255,255,0.4); background: #1B2A4A;
                      padding: 16px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">

            <!-- Header — same style as Orato's header -->
            <div class="header">
              <h1 style="margin:0; font-size:26px;">🩸 LifeLink</h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:13px;">
                FIND. CONNECT. SAVE LIVES.
              </p>
            </div>

            <!-- Body -->
            <div class="content">
              <h2 style="color:#1B2A4A;">Hi ${donorName}!</h2>

              <p>Someone in your district urgently needs
                <strong style="color:#C0171D;">${bloodType}</strong> blood.
                Your blood type is a match — you could save a life today!
              </p>

              <!-- Request details — like Orato's info boxes -->
              <div class="request-box">
                <p style="margin:0 0 10px; font-weight:bold; color:#C0171D;">
                  ${urgencyEmoji} ${urgency} Blood Request
                </p>
                <p style="margin:4px 0; color:#374151;">
                  🩸 <strong>Blood Type:</strong> ${bloodType}
                </p>
                <p style="margin:4px 0; color:#374151;">
                  🏥 <strong>Hospital:</strong> ${hospital}
                </p>
                <p style="margin:4px 0; color:#374151;">
                  📍 <strong>Location:</strong>
                  ${location.city
                    ? `${location.city}, ${location.district}`
                    : location.district}
                </p>
              </div>

              <!-- CTA Button — same pattern as Orato's button -->
              <div style="text-align:center; margin:30px 0;">
                
                  href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/browse"
                  class="button"
                >
                  View Request &amp; Respond 🩸
                </a>
              </div>

              <p style="color:#9CA3AF; font-size:12px; text-align:center;">
                You received this because your blood type matches this urgent request.<br/>
                Every blood donation can save up to 3 lives. ❤️
              </p>

              <p>Best regards,<br><strong>The LifeLink Team</strong></p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin:0;">© 2026 LifeLink. Find. Connect. Save Lives.</p>
              <p style="margin:6px 0 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>

          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${donorEmail} — ID: ${info.messageId}`);
    return true;

  } catch (error) {
    // Don't crash the app if email fails
    // Same pattern as Orato — log but don't throw
    console.error(`❌ Email failed for ${donorEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendDonorNotification, verifyEmailConfig };