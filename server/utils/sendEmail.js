const nodemailer = require('nodemailer');

// ── Email Transporter Setup ───────────────────────────────────
// nodemailer uses LifeLink's own Gmail to send emails
// FROM: alertslifelink@gmail.com (our app's fixed email)
// TO:   any donor's personal email  (stored in DB from registration)
//
// Users NEVER need to provide any password or credentials
// They just register with their normal email — we send TO them
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // alertslifelink@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail App Password (no spaces)
  }
});

// ─────────────────────────────────────────────────────────────
// Verify email config works on server startup
// Good practice — tells us immediately if email is broken
// ─────────────────────────────────────────────────────────────
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
// Send blood request notification email to a matching donor
//
// Called from requestController when a blood request is posted
// Sends a beautiful HTML email matching LifeLink brand colors
// ─────────────────────────────────────────────────────────────
const sendDonorNotification = async ({ donorEmail, donorName, request }) => {

  // Skip if no email address found for this donor
  if (!donorEmail) {
    console.log('⚠️  No email for donor, skipping...');
    return false;
  }

  try {
    const { bloodType, hospital, location, urgency } = request;

    // Urgency emoji — makes subject line stand out in inbox
    const urgencyEmoji = {
      Critical: '🚨',
      Urgent:   '⚠️',
      Normal:   '💙'
    }[urgency] || '🩸';

    await transporter.sendMail({
      from:    `"LifeLink " <${process.env.EMAIL_USER}>`,
      to:      donorEmail,
      subject: `${urgencyEmoji} ${urgency} — ${bloodType} blood needed in ${location.district}`,

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }
            .container {
              max-width: 560px;
              margin: 30px auto;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1B2A4A, #C0171D);
              padding: 30px;
              text-align: center;
              color: white;
            }
            .content {
              background: white;
              padding: 30px;
            }
            .request-box {
              background: #FFF5F5;
              border-left: 4px solid #C0171D;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background: #C0171D;
              color: white;
              padding: 14px 36px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              font-size: 15px;
            }
            .footer {
              background: #1B2A4A;
              padding: 16px;
              text-align: center;
              color: rgba(255,255,255,0.4);
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="container">

            <!-- Header -->
            <div class="header">
              <h1 style="margin:0; font-size:26px; font-weight:bold;"> LifeLink</h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:13px;">
                FIND. CONNECT. SAVE LIVES.
              </p>
            </div>

            <!-- Body -->
            <div class="content">
              <h2 style="color:#1B2A4A;">Hi ${donorName}! </h2>

              <p>
                Someone in your district urgently needs
                <strong style="color:#C0171D;">${bloodType}</strong> blood.
                Your blood type is a match — <strong>you could save a life today!</strong>
              </p>

              <!-- Request Details -->
              <div class="request-box">
                <p style="margin:0 0 10px; font-weight:bold; color:#C0171D; font-size:14px;">
                  ${urgencyEmoji} ${urgency} Blood Request
                </p>
                <p style="margin:4px 0; color:#374151; font-size:14px;">
                   <strong>Blood Type:</strong> ${bloodType}
                </p>
                <p style="margin:4px 0; color:#374151; font-size:14px;">
                   <strong>Hospital:</strong> ${hospital}
                </p>
                <p style="margin:4px 0; color:#374151; font-size:14px;">
                   <strong>Location:</strong>
                  ${location.city
                    ? `${location.city}, ${location.district}`
                    : location.district}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center; margin:30px 0;">
                
                  href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/browse"
                  class="button"
                >
                  View Request &amp; Respond 
                </a>
              </div>

              <p style="color:#6B7280; font-size:13px; text-align:center;">
                You received this because your blood type matches this urgent request.<br/>
                Every blood donation can save up to 3 lives. ❤️
              </p>

              <p style="margin-top:24px;">
                Best regards,<br/>
                <strong>The LifeLink Team</strong>
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin:0;">© 2026 LifeLink — Find. Connect. Save Lives.</p>
              <p style="margin:6px 0 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>

          </div>
        </body>
        </html>
      `
    });

    console.log(`📧 Email sent successfully to ${donorEmail}`);
    return true;

  } catch (error) {
    // Don't crash the app if email fails
    // Just log the error and continue
    console.error(`❌ Email failed for ${donorEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendDonorNotification, verifyEmailConfig };