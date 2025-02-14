import nodemailer from "nodemailer";
import { type User } from "@prisma/client";

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Common email styles
const commonStyles = `
  /* Email client safe fonts */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  --font-heading: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: var(--font-primary);
    line-height: 1.6;
    color: #1F2937;
  }
  .header {
    background: linear-gradient(135deg, #3B82F6, #2563EB);
    padding: 40px 20px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  }
  .header h1 {
    font-family: var(--font-heading);
    color: white;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .content {
    background-color: #ffffff;
    padding: 40px 30px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .welcome-message {
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 24px;
  }
  .button {
    display: inline-block;
    padding: 14px 28px;
    background: linear-gradient(135deg, #3B82F6, #2563EB);
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-family: var(--font-heading);
    margin: 24px 0;
    text-align: center;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    color: #6B7280;
    font-size: 14px;
    font-family: var(--font-primary);
  }
`;

export async function sendWelcomeEmail(user: { email: string; name?: string | null }, isSocialLogin = false, provider?: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Auth App" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to Auth App! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${commonStyles}
            .feature-list {
              background-color: #F3F4F6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin: 12px 0;
              color: #4B5563;
              font-family: var(--font-primary);
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F3F4F6;">
          <div class="email-container">
            <div class="header">
              <h1>Welcome to Auth App! 🚀</h1>
            </div>
            <div class="content">
              <div class="welcome-message">
                Hello ${user.name || 'there'}! 👋
                <br><br>
                ${isSocialLogin 
                  ? `Thank you for joining us using your ${provider} account.` 
                  : 'Thank you for verifying your email and joining our community!'}
              </div>

              <p>We're thrilled to have you on board! Here's what you can do with your new account:</p>

              <div class="feature-list">
                <div class="feature-item">
                  🎯 Complete your profile with personal details
                </div>
                <div class="feature-item">
                  🔒 Manage your account security settings
                </div>
                <div class="feature-item">
                  🌐 Connect your social media accounts
                </div>
                <div class="feature-item">
                  ✨ Enjoy a personalized dashboard experience
                </div>
              </div>

              <p>Ready to get started?</p>

              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">
                Go to Dashboard
              </a>

              <p>Need help? Here are some quick links:</p>
              <ul style="color: #4B5563;">
                <li>📘 <a href="#" style="color: #3B82F6;">Documentation</a></li>
                <li>❓ <a href="#" style="color: #3B82F6;">FAQ</a></li>
                <li>📧 <a href="#" style="color: #3B82F6;">Support</a></li>
              </ul>

              <div class="social-links">
                <p>Follow us on social media:</p>
                <a href="#" class="social-icon">📱</a>
                <a href="#" class="social-icon">💼</a>
                <a href="#" class="social-icon">🐦</a>
              </div>

              <div class="footer">
                <p>This email was sent by Auth App. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Auth App. All rights reserved.</p>
                <p style="color: #9CA3AF;">
                  Our address: 123 Auth Street, Security City, ST 12345
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Auth App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Auth App - Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${commonStyles}
            .verification-code {
              background-color: #F3F4F6;
              padding: 16px;
              border-radius: 8px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 14px;
              margin: 16px 0;
              word-break: break-all;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F3F4F6;">
          <div class="email-container">
            <div class="header">
              <h1>Welcome to Auth App! 🚀</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up! We're excited to have you on board.</p>
              <p>Please click the button below to verify your email address and get started:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button" style="color: #ffffff; text-decoration: none;">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this URL into your browser:</p>
              <div class="verification-code">
                ${verificationUrl}
              </div>
              
              <p>This link will expire in 24 hours for security reasons.</p>
              
              <p><strong>Why verify?</strong></p>
              <ul>
                <li>Secure your account</li>
                <li>Access all features</li>
                <li>Receive important updates</li>
              </ul>
              
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Auth App. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Auth App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
} 