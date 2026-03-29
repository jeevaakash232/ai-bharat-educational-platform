/**
 * Email Service using Nodemailer + Gmail SMTP
 * Sends feedback notifications to aibharath07@gmail.com
 *
 * Setup: Add these to your .env / Render environment variables:
 *   GMAIL_USER=aibharath07@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   (Gmail App Password — NOT your login password)
 *
 * To get a Gmail App Password:
 *   1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
 *   2. Then go to myaccount.google.com/apppasswords
 *   3. Create an app password for "Mail" → copy the 16-char password
 */

import nodemailer from 'nodemailer';

const NOTIFY_EMAIL = 'aibharath07@gmail.com';

function getTransporter() {
  const user = process.env.GMAIL_USER || NOTIFY_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) {
    console.warn('⚠️ GMAIL_APP_PASSWORD not set — email notifications disabled');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendFeedbackEmail({ userName, userEmail, userType, rating, category, message }) {
  const transporter = getTransporter();
  if (!transporter) return false;

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const subject = `[EduLearn Feedback] ${stars} ${category} — from ${userName}`;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f5f7;padding:24px;border-radius:12px;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:10px;padding:20px 24px;color:white;margin-bottom:20px;">
    <h2 style="margin:0;font-size:20px;">📬 New Feedback — EduLearn</h2>
    <p style="margin:6px 0 0;opacity:0.85;font-size:14px;">${stars} ${rating}/5 · ${category}</p>
  </div>
  <div style="background:white;border-radius:10px;padding:20px 24px;margin-bottom:16px;">
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#6b7280;width:100px;">From</td><td style="padding:6px 0;font-weight:700;color:#1a1a2e;">${userName}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;color:#1a1a2e;">${userEmail}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Role</td><td style="padding:6px 0;color:#1a1a2e;text-transform:capitalize;">${userType}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Category</td><td style="padding:6px 0;color:#1a1a2e;">${category}</td></tr>
    </table>
  </div>
  <div style="background:white;border-radius:10px;padding:20px 24px;">
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
    <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;">${message.replace(/\n/g, '<br>')}</p>
  </div>
  <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">EduLearn · AI-Powered Education Platform</p>
</div>`;

  try {
    await transporter.sendMail({
      from: `"EduLearn Feedback" <${process.env.GMAIL_USER || NOTIFY_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject,
      html,
      text: `From: ${userName} (${userType})\nEmail: ${userEmail}\nRating: ${rating}/5\nCategory: ${category}\n\n${message}`,
    });
    console.log(`✅ Feedback email sent to ${NOTIFY_EMAIL}`);
    return true;
  } catch (err) {
    console.error('⚠️ Email send failed (non-fatal):', err.message);
    return false;
  }
}
