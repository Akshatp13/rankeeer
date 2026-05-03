import nodemailer from 'nodemailer';
import 'dotenv/config';

// ─── Transporter Setup ───────────────────────────────────────────────────────
// Note: In production, use services like Resend, SendGrid, or AWS SES.
// For dev, you can use Gmail or a service like Mailtrap.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Templates ───────────────────────────────────────────────────────────────

const commonStyles = `
  body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
  .content { padding: 40px 30px; line-height: 1.6; }
  .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  .stat-card { background-color: #f8fafc; border: 1px border #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
  .accent { color: #6366f1; font-weight: 700; }
`;

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${commonStyles}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1 style="margin:0; font-size: 28px;">Welcome to RankRise AI! 🚀</h1>
          </div>
          <div className="content">
            <p>Hi <span className="accent">${name}</span>,</p>
            <p>Your journey to academic excellence starts here. We're thrilled to have you on board! RankRise AI is designed to make your preparation smarter, faster, and more engaging.</p>
            <div className="stat-card">
              <h3 style="margin-top:0;">What's Next?</h3>
              <ul style="padding-left: 20px;">
                <li><strong>Explore Exam Catalog:</strong> Pick your target exam and subjects.</li>
                <li><strong>Neural Forge:</strong> Generate custom tests to identify your weak spots.</li>
                <li><strong>Smart Revision:</strong> Upload your notes and let our AI summarize them.</li>
              </ul>
            </div>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" className="button">Go to Dashboard</a>
            <p style="margin-top: 30px;">Happy Learning,<br/><strong>Team RankRise</strong></p>
          </div>
          <div className="footer">
            &copy; 2026 RankRise AI. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"RankRise AI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to RankRise AI - Your AI Study Partner!',
      html,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendTestResultEmail = async (email, name, testDetails) => {
  const { exam, subject, score, total, accuracy, xpEarned } = testDetails;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${commonStyles}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1 style="margin:0; font-size: 24px;">Test Performance Summary 📊</h1>
          </div>
          <div className="content">
            <p>Great job on completing your test, <span className="accent">${name}</span>!</p>
            <div className="stat-card">
              <h3 style="margin-top:0; color: #6366f1;">${subject} (${exam})</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Score</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${score} / ${total}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Accuracy</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${accuracy}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">XP Earned</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #fbbf24;">+${xpEarned} XP</td>
                </tr>
              </table>
            </div>
            <p>Consistency is key. Head back to the app to analyze your mistakes and bridge your knowledge gaps.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/weakness" className="button">View Weakness Analysis</a>
          </div>
          <div className="footer">
            Keep pushing, you're doing great! 🌟
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"RankRise AI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Test Results: ${subject} (${accuracy}%)`,
      html,
    });
  } catch (error) {
    console.error('Error sending test result email:', error);
  }
};
