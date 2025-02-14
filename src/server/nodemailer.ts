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
    color: #000000;
  }
  .header {
    background: #000000;
    padding: 40px 20px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  }
  .header h1 {
    font-family: var(--font-heading);
    color: #ffffff;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
  }
  .content {
    background-color: #ffffff;
    padding: 40px 30px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .welcome-message {
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 24px;
  }
  .button {
    display: inline-block;
    padding: 14px 28px;
    background: #000000;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-family: var(--font-heading);
    margin: 24px 0;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .button:hover,
  .button:visited {
    color: #ffffff !important;
    text-decoration: none;
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    color: #666666;
    font-size: 14px;
    font-family: var(--font-primary);
  }
  .feature-list {
    background-color: #f8f8f8;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    border: 1px solid #e5e5e5;
  }
  .feature-item {
    display: flex;
    align-items: center;
    margin: 12px 0;
    color: #000000;
    font-family: var(--font-primary);
  }
  a {
    color: #000000;
    text-decoration: underline;
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
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f8f8f8;
            }
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: #000000;
              padding: 40px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.025em;
            }
            .content {
              padding: 40px 30px;
              color: #000000;
            }
            .welcome-message {
              font-size: 18px;
              font-weight: 600;
              color: #000000;
              margin-bottom: 24px;
            }
            .feature-list {
              background-color: #f8f8f8;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #e5e5e5;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin: 12px 0;
              color: #000000;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background: #000000;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 24px 0;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              color: #666666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Welcome to Auth App! 🚀</h1>
            </div>
            <div class="content">
              <div class="welcome-message">
                Hello ${user.name || user.email.split('@')[0]}! 👋
              </div>
              
              <p>Thank you for ${isSocialLogin ? `signing up with ${provider}` : 'joining'} Auth App! We're excited to have you on board.</p>
              
              <div class="feature-list">
                <h3 style="margin-top: 0;">What you can do now:</h3>
                <div class="feature-item">✨ Customize your profile</div>
                <div class="feature-item">🔒 Manage your account settings</div>
                <div class="feature-item">🌐 Connect with social accounts</div>
                <div class="feature-item">📱 Access from any device</div>
              </div>
              
              <p>Ready to get started?</p>
              
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">
                Go to Dashboard
              </a>
              
              <p style="margin-top: 32px;">
                If you have any questions or need assistance, feel free to reach out to our support team.
              </p>
              
              <div class="footer">
                <p>Best regards,<br>The Auth App Team</p>
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
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f8f8f8;
            }
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              background-color: #000000;
              color: #ffffff;
              padding: 24px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .email-content {
              padding: 32px 24px;
              color: #000000;
            }
            h2 {
              color: #000000;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 16px;
              font-weight: 600;
            }
            h3 {
              color: #000000;
              font-size: 20px;
              margin-top: 32px;
              margin-bottom: 16px;
              font-weight: 600;
            }
            p {
              margin: 16px 0;
              color: #000000;
              font-size: 16px;
            }
            .verification-button {
              display: inline-block;
              background-color: #000000;
              color: #ffffff !important;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              margin: 24px 0;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .verification-button:hover,
            .verification-button:visited {
              color: #ffffff !important;
              text-decoration: none;
            }
            .verification-url {
              background-color: #f8f8f8;
              padding: 16px;
              border-radius: 6px;
              word-break: break-all;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 14px;
              color: #000000;
              margin: 16px 0;
              border: 1px solid #e5e5e5;
            }
            .expiry-notice {
              font-size: 14px;
              color: #666666;
              margin-top: 24px;
            }
            .feature-list {
              margin: 24px 0;
              padding-left: 24px;
            }
            .feature-list li {
              margin: 8px 0;
              color: #000000;
            }
            .footer-note {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #e5e5e5;
              font-size: 14px;
              color: #666666;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Welcome to Auth App! 🚀</h1>
            </div>
            <div class="email-content">
              <h2>Verify Your Email Address</h2>
              
              <p>Thank you for signing up! We're excited to have you on board.</p>
              
              <p>Please click the button below to verify your email address and get started:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="verification-button">
                  Verify Email Address
                </a>
              </div>
              
              <p>Or copy and paste this URL into your browser:</p>
              
              <div class="verification-url">
                ${verificationUrl}
              </div>
              
              <p class="expiry-notice">This link will expire in 24 hours for security reasons.</p>
              
              <h3>Why verify?</h3>
              <ul class="feature-list">
                <li>Secure your account</li>
                <li>Access all features</li>
                <li>Receive important updates</li>
              </ul>
              
              <p class="footer-note">
                If you didn't create an account, you can safely ignore this email.
              </p>
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