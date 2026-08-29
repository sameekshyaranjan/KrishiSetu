const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

/**
 * SendGrid & Nodemailer Hybrid Email Delivery Engine
 * Automatically routes through SendGrid Web API v3 when SENDGRID_API_KEY is configured.
 */

const getOtpEmailTemplate = ({ otp, name = 'Valued User', role = 'User' }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KrishiSetu Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #15803d, #16a34a); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; text-align: center; }
    .greeting { font-size: 16px; color: #1e293b; font-weight: 600; margin-bottom: 12px; }
    .desc { font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 24px; }
    .otp-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 18px; margin: 20px 0; display: inline-block; min-width: 220px; }
    .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #15803d; font-family: monospace; }
    .expiry { font-size: 12px; color: #dc2626; font-weight: 600; margin-top: 6px; }
    .security-note { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px; text-align: left; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🌾 KrishiSetu | ಕೃಷಿಸೇತು</h1>
      <p>Karnataka Digital APMC & Unified Agri-Commerce Gateway</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name}! 👋</div>
      <div class="desc">
        Thank you for joining KrishiSetu as a registered <strong>${role === 'farmer' ? 'Farmer' : role === 'trader' ? 'Licensed APMC Trader' : 'User'}</strong>. Please use the One-Time Password (OTP) below to verify your email address:
      </div>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱️ Valid for 5 Minutes</div>
      </div>

      <div class="security-note">
        🔒 <strong>Security Warning:</strong> Never share this OTP with anyone. KrishiSetu APMC officers or bank representatives will never ask for your verification code. If you did not request this registration, please ignore this email.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} KrishiSetu Agriculture Network. Karnataka APMC Mandi Gateway.
    </div>
  </div>
</body>
</html>
`;
};

const sendEmail = async (options) => {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'support@krishisetu.in';
  const fromName = process.env.FROM_NAME || 'KrishiSetu Verification';

  // 1. Primary Engine: SendGrid API v3
  if (sendgridApiKey && sendgridApiKey !== 'dummy_sendgrid_key_for_now' && sendgridApiKey.startsWith('SG.')) {
    try {
      sgMail.setApiKey(sendgridApiKey);
      const msg = {
        to: options.email,
        from: {
          email: fromEmail,
          name: fromName
        },
        subject: options.subject || 'KrishiSetu Verification Code',
        text: options.message,
        html: options.html || (options.otp ? getOtpEmailTemplate({ otp: options.otp, role: options.role, name: options.name }) : undefined)
      };

      const result = await sgMail.send(msg);
      console.log(`[SendGrid] ✅ Email OTP sent successfully to: ${options.email} (Status: ${result[0]?.statusCode || 202})`);
      return true;
    } catch (err) {
      console.error('[SendGrid Error] Failed to send email via API:', err.response?.body || err.message);
    }
  }

  // 2. Secondary Engine: SMTP Transporter (if configured)
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });

      const message = {
        from: `${fromName} <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || (options.otp ? getOtpEmailTemplate({ otp: options.otp, role: options.role, name: options.name }) : undefined)
      };

      await transporter.sendMail(message);
      console.log(`[SMTP] ✅ Email sent to: ${options.email}`);
      return true;
    } catch (err) {
      console.error('[SMTP Error] Failed to send email:', err.message);
    }
  }

  // 3. Fallback for local development when no SendGrid key is provided
  console.log(`\n=================================`);
  console.log(`[DEV EMAIL SIMULATION]`);
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`OTP Code: ${options.otp || 'N/A'}`);
  console.log(`Message: \n${options.message}`);
  console.log(`=================================\n`);
  return true;
};

module.exports = sendEmail;
