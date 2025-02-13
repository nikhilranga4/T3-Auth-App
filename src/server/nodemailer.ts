import nodemailer from "nodemailer";

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
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
            }
            .header {
              background-color:rgb(0, 0, 0);
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: rgb(0, 0, 0);
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: rgb(40, 40, 40);
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666666;
              font-size: 12px;
            }
            .verification-code {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              font-family: monospace;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
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