const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Mocking email in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n=================================`);
    console.log(`[DEV EMAIL MOCK] To: ${options.email}`);
    console.log(`[DEV EMAIL MOCK] Subject: ${options.subject}`);
    console.log(`[DEV EMAIL MOCK] Message: \n${options.message}`);
    console.log(`=================================\n`);
    return true;
  }

  // Production configuration (using Mailtrap or actual SMTP provider)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
