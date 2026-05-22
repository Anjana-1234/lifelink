const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────────
// Uses Gmail SMTP with explicit IPv4 forced
// family: 4 forces IPv4 — fixes ENETUNREACH on Railway
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   465,          // changed from 587 to 465
    secure: true,         // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false  // helps with Railway SSL issues
    },
    socketTimeout: 10000,        // 10 second timeout
    connectionTimeout: 10000,
    dnsTimeout: 10000,
    logger: false,
    debug:  false
  });
};

// ── Verify email config ───────────────────────────────────────
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service ready');
    return true;
  } catch (error) {
    // Don't crash server if email fails — just log it
    console.error('❌ Email config error:', error.message);
    return false;
  }
};

// ── Send donor notification email ─────────────────────────────
const sendDonorNotification = async ({ donorEmail, donorName, request }) => {
  if (!donorEmail) {
    console.log('⚠️  No email for donor, skipping...');
    return false;
  }

  try {
    // Create fresh transporter for each email
    // Avoids stale connection issues on Railway
    const transporter = createTransporter();

    const { bloodType, hospital, location, urgency } = request;

    const urgencyEmoji = {
      Critical: '🚨',
      Urgent:   '⚠️',
      Normal:   '💙'
    }[urgency] || '🩸';

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    await transporter.sendMail({
      from:    `"LifeLink Blood Network" <${process.env.EMAIL_USER}>`,
      to:      donorEmail,
      subject: `${urgencyEmoji} ${urgency} - ${bloodType} blood needed in ${location?.district}`,

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: Arial, sans-serif;
              background-color: #f3f4f6;
              color: #333;
              line-height: 1.6;
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
            .header h1 {
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 6px;
            }
            .header p {
              color: rgba(255,255,255,0.75);
              font-size: 12px;
              letter-spacing: 2px;
            }
            .content {
              background: white;
              padding: 32px;
            }
            .greeting {
              font-size: 20px;
              font-weight: bold;
              color: #1B2A4A;
              margin-bottom: 12px;
            }
            .intro {
              color: #4B5563;
              font-size: 15px;
              margin-bottom: 24px;
            }
            .request-box {
              background: #FFF5F5;
              border-left: 4px solid #C0171D;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 28px;
            }
            .request-box .urgency-label {
              font-weight: bold;
              color: #C0171D;
              font-size: 14px;
              margin-bottom: 14px;
            }
            .request-box .detail-row {
              display: flex;
              gap: 8px;
              margin-bottom: 8px;
              font-size: 14px;
              color: #374151;
            }
            .request-box .label {
              font-weight: bold;
              min-width: 90px;
            }
            .cta-wrapper {
              text-align: center;
              margin: 28px 0;
            }
            .cta-button {
              display: inline-block;
              background: #C0171D;
              color: white;
              padding: 14px 40px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              font-size: 15px;
            }
            .note {
              color: #9CA3AF;
              font-size: 12px;
              text-align: center;
              margin-top: 8px;
            }
            .sign-off {
              margin-top: 28px;
              color: #4B5563;
              font-size: 14px;
            }
            .footer {
              background: #1B2A4A;
              padding: 16px;
              text-align: center;
            }
            .footer p {
              color: rgba(255,255,255,0.4);
              font-size: 11px;
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">

            <div class="header">
              <h1>LifeLink</h1>
              <p>FIND. CONNECT. SAVE LIVES.</p>
            </div>

            <div class="content">
              <p class="greeting">Hi ${donorName}! </p>

              <p class="intro">
                Someone in your district urgently needs
                <strong style="color:#C0171D;">${bloodType}</strong> blood.
                Your blood type matches — <strong>you could save a life today!</strong>
              </p>

              <div class="request-box">
                <p class="urgency-label">${urgencyEmoji} ${urgency} Blood Request</p>
                <div class="detail-row">
                  <span class="label"> Blood Type:</span>
                  <span>${bloodType}</span>
                </div>
                <div class="detail-row">
                  <span class="label"> Hospital:</span>
                  <span>${hospital}</span>
                </div>
                <div class="detail-row">
                  <span class="label"> Location:</span>
                  <span>${location?.city
                    ? `${location.city}, ${location.district}`
                    : location?.district}</span>
                </div>
              </div>

              <div class="cta-wrapper">
                <a href="${appUrl}/browse" class="cta-button">
                  View Request &amp; Respond 🩸
                </a>
                <p class="note">Opens in LifeLink app</p>
              </div>

              <p class="note" style="margin-top: 16px;">
                You received this because your blood type matches this urgent request.
                Every blood donation can save up to 3 lives. ❤️
              </p>

              <div class="sign-off">
                Best regards,<br/>
                <strong>The LifeLink Team</strong>
              </div>
            </div>

            <div class="footer">
              <p>© 2026 LifeLink — Find. Connect. Save Lives.</p>
              <p>This is an automated message. Please do not reply.</p>
            </div>

          </div>
        </body>
        </html>
      `
    });

    console.log(`📧 Email sent successfully to ${donorEmail}`);
    return true;

  } catch (error) {
    console.error(`❌ Email failed for ${donorEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendDonorNotification, verifyEmailConfig };