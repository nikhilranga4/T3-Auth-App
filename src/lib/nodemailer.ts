import nodemailer from "nodemailer";
import { env } from "~/env";

// Create reusable transporter object using Gmail SMTP with OAuth2
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: env.GMAIL_USER,
    clientId: env.GMAIL_CLIENT_ID,
    clientSecret: env.GMAIL_CLIENT_SECRET,
    refreshToken: env.GMAIL_REFRESH_TOKEN,
    accessToken: env.GMAIL_ACCESS_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: {
      name: "AuthApp",
      address: env.GMAIL_USER
    },
    to: email,
    subject: "Verify your email address",
    text: `Welcome to AuthApp! Please verify your email address by clicking this link: ${verificationLink}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to AuthApp!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string) => {
  const mailOptions = {
    from: {
      name: "AuthApp",
      address: env.GMAIL_USER
    },
    to: email,
    subject: "Welcome to AuthApp!",
    text: "Thank you for verifying your email address. Your account is now active! You can now sign in and complete your profile with additional details.",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to AuthApp!</h2>
        <p>Thank you for verifying your email address. Your account is now active!</p>
        <p>You can now sign in and complete your profile with additional details.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}; 