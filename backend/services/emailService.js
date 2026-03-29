/**
 * Email Service using AWS SES
 * Sends feedback notifications to aibharath07@gmail.com
 *
 * NOTE: The sender address must be verified in AWS SES.
 * If your account is in SES sandbox, the recipient must also be verified.
 * To verify: AWS Console → SES → Verified Identities → Create Identity
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

let sesClient = null;

function getClient() {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.SES_REGION || process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim(),
      },
    });
  }
  return sesClient;
}

const NOTIFY_EMAIL = 'aibharath07@gmail.com';
// SES requires a verified sender — use the same address or a verified domain
const SENDER_EMAIL = process.env.SES_SENDER_EMAIL || 'aibharath07@gmail.com';

/**
 * Send feedback notification email
 */
export async function sendFeedbackEmail({ userName, userEmail, userType, rating, category, message }) {
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  const subject = `[EduLearn Feedback] ${stars} ${category} — from ${userName}`;

  const body = `
New feedback received on EduLearn!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM:     ${userName} (${userType})
EMAIL:    ${userEmail}
RATING:   ${stars} (${rating}/5)
CATEGORY: ${category}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESSAGE:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent from EduLearn Platform
  `.trim();

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f5f7; padding: 24px; border-radius: 12px;">
  <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 10px; padding: 20px 24px; color: white; margin-bottom: 20px;">
    <h2 style="margin: 0; font-size: 20px;">📬 New Feedback — EduLearn</h2>
    <p style="margin: 6px 0 0; opacity: 0.85; font-size: 14px;">${stars} ${rating}/5 · ${category}</p>
  </div>
  <div style="background: white; border-radius: 10px; padding: 20px 24px; margin-bottom: 16px;">
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #6b7280; width: 100px;">From</td><td style="padding: 6px 0; font-weight: 700; color: #1a1a2e;">${userName}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0; color: #1a1a2e;">${userEmail}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Role</td><td style="padding: 6px 0; color: #1a1a2e; text-transform: capitalize;">${userType}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Category</td><td style="padding: 6px 0; color: #1a1a2e;">${category}</td></tr>
    </table>
  </div>
  <div style="background: white; border-radius: 10px; padding: 20px 24px;">
    <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
    <p style="margin: 0; font-size: 15px; color: #1a1a2e; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
  </div>
  <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px;">EduLearn · AI-Powered Education Platform</p>
</div>
  `.trim();

  try {
    await getClient().send(new SendEmailCommand({
      Source: SENDER_EMAIL,
      Destination: { ToAddresses: [NOTIFY_EMAIL] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: body, Charset: 'UTF-8' },
          Html: { Data: htmlBody, Charset: 'UTF-8' },
        },
      },
    }));
    console.log(`✅ Feedback email sent to ${NOTIFY_EMAIL}`);
    return true;
  } catch (err) {
    // Non-fatal — feedback is still saved to DynamoDB even if email fails
    console.error('⚠️ SES email failed (non-fatal):', err.message);
    return false;
  }
}
