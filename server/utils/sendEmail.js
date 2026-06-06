const { Resend } = require('resend');

// ── Resend Client ─────────────────────────────────────────────
// Resend works perfectly on Railway — no IPv6 issues like Gmail
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Sender email ──────────────────────────────────────────────
// Using Resend's free onboarding domain
// After adding custom domain, change to: noreply@yourdomain.com
const FROM_EMAIL = 'LifeLink <onboarding@resend.dev>';

// ─────────────────────────────────────────────────────────────
// Verify email config on startup
// ─────────────────────────────────────────────────────────────
const verifyEmailConfig = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment');
      return false;
    }
    console.log('✅ Email service ready (Resend)');
    return true;
  } catch (error) {
    console.error('❌ Email config error:', error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────
// Send blood request notification to matching donor
// Called when someone posts a blood request
// ─────────────────────────────────────────────────────────────
const sendDonorNotification = async ({ donorEmail, donorName, request }) => {
  if (!donorEmail) {
    console.log('⚠️ No email for donor, skipping...');
    return false;
  }

  try {
    const { bloodType, hospital, location, urgency } = request;

    const urgencyEmoji = {
      Critical: '🚨',
      Urgent:   '⚠️',
      Normal:   '💙'
    }[urgency] || '🩸';

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const { error } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      donorEmail,
      subject: `${urgencyEmoji} ${urgency} — ${bloodType} blood needed in ${location?.district}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:0;">
          <div style="max-width:560px;margin:30px auto;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1B2A4A,#C0171D);
                        padding:30px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:26px;font-weight:bold;">
                 LifeLink
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);
                        font-size:12px;letter-spacing:2px;">
                FIND. CONNECT. SAVE LIVES.
              </p>
            </div>

            <!-- Body -->
            <div style="background:white;padding:32px;">
              <h2 style="color:#1B2A4A;margin-bottom:12px;">
                Hi ${donorName}! 
              </h2>
              <p style="color:#4B5563;font-size:15px;margin-bottom:24px;">
                Someone in your district urgently needs
                <strong style="color:#C0171D;">${bloodType}</strong> blood.
                Your blood type matches —
                <strong>you could save a life today!</strong>
              </p>

              <!-- Request Details -->
              <div style="background:#FFF5F5;border-left:4px solid #C0171D;
                          border-radius:8px;padding:20px;margin-bottom:28px;">
                <p style="font-weight:bold;color:#C0171D;
                          font-size:14px;margin:0 0 14px;">
                  ${urgencyEmoji} ${urgency} Blood Request
                </p>
                <p style="margin:4px 0;color:#374151;font-size:14px;">
                  🩸 <strong>Blood Type:</strong> ${bloodType}
                </p>
                <p style="margin:4px 0;color:#374151;font-size:14px;">
                  🏥 <strong>Hospital:</strong> ${hospital}
                </p>
                <p style="margin:4px 0;color:#374151;font-size:14px;">
                  📍 <strong>Location:</strong>
                  ${location?.city
                    ? `${location.city}, ${location.district}`
                    : location?.district}
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${appUrl}/browse"
                   style="display:inline-block;background:#C0171D;color:white;
                          padding:14px 40px;text-decoration:none;border-radius:10px;
                          font-weight:bold;font-size:15px;">
                  View Request &amp; Respond 
                </a>
              </div>

              <p style="color:#9CA3AF;font-size:12px;text-align:center;">
                You received this because your blood type matches this urgent request.
                <br/>Every donation can save up to 3 lives. ❤️
              </p>

              <p style="margin-top:24px;color:#4B5563;font-size:14px;">
                Best regards,<br/>
                <strong>The LifeLink Team</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#1B2A4A;padding:16px;text-align:center;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0;">
                © 2026 LifeLink — Find. Connect. Save Lives.
              </p>
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0;">
                This is an automated message. Please do not reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error(`❌ Email failed for ${donorEmail}:`, error.message);
      return false;
    }

    console.log(`📧 Email sent successfully to ${donorEmail}`);
    return true;

  } catch (error) {
    console.error(`❌ Email failed for ${donorEmail}:`, error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────
// Send email verification link
// Called after user registers
// ─────────────────────────────────────────────────────────────
const sendVerificationEmail = async ({ userEmail, userName, verificationUrl }) => {
  if (!userEmail) return false;

  try {
    const { error } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      userEmail,
      subject: 'Verify your LifeLink email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="font-family:Arial,sans-serif;background:#f3f4f6;
                     margin:0;padding:0;">
          <div style="max-width:560px;margin:30px auto;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1B2A4A,#C0171D);
                        padding:30px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;">
                 LifeLink
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);
                        font-size:12px;letter-spacing:2px;">
                FIND. CONNECT. SAVE LIVES.
              </p>
            </div>

            <!-- Body -->
            <div style="background:white;padding:32px;">
              <h2 style="color:#1B2A4A;margin-bottom:8px;">
                Hi ${userName}! 
              </h2>
              <p style="color:#4B5563;font-size:15px;margin-bottom:24px;">
                Welcome to LifeLink! Please verify your email address
                to activate your account and start connecting with donors.
              </p>

              <!-- Verify Box -->
              <div style="background:#F0FDF4;border:2px solid #86EFAC;
                          border-radius:12px;padding:24px;text-align:center;
                          margin-bottom:24px;">
                <p style="color:#15803D;font-weight:bold;
                          margin:0 0 8px;font-size:16px;">
                  ✅ One click to verify
                </p>
                <p style="color:#6B7280;font-size:13px;margin:0 0 20px;">
                  Click the button below to confirm your email address
                </p>
                <a href="${verificationUrl}"
                   style="display:inline-block;background:#15803D;color:white;
                          padding:14px 40px;text-decoration:none;
                          border-radius:10px;font-weight:bold;font-size:15px;">
                  Verify My Email ✅
                </a>
              </div>

              <p style="color:#9CA3AF;font-size:12px;text-align:center;
                        margin-bottom:16px;">
                This link expires in 24 hours.<br/>
                If you didn't create a LifeLink account, ignore this email.
              </p>

              <p style="color:#9CA3AF;font-size:11px;">
                Or copy this link into your browser:<br/>
                <span style="color:#C0171D;word-break:break-all;">
                  ${verificationUrl}
                </span>
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#1B2A4A;padding:16px;text-align:center;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0;">
                © 2026 LifeLink — Find. Connect. Save Lives.
              </p>
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0;">
                This is an automated message. Please do not reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error(`❌ Verification email failed for ${userEmail}:`, error.message);
      return false;
    }

    console.log(`📧 Verification email sent to ${userEmail}`);
    return true;

  } catch (error) {
    console.error(`❌ Verification email failed:`, error.message);
    return false;
  }
};

module.exports = {
  sendDonorNotification,
  sendVerificationEmail,
  verifyEmailConfig
};