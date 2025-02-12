import { Resend } from 'resend';

// Get environment variables in a type-safe way
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value ?? defaultValue ?? '';
};

// Initialize Resend with API key
const resendApiKey = getEnvVar('RESEND_API_KEY');
const resend = new Resend(resendApiKey);

// Get the base URL for the application
const getBaseUrl = () => {
  const vercelUrl = getEnvVar('VERCEL_URL', '');
  const nextAuthUrl = getEnvVar('NEXTAUTH_URL', '');
  const nodeEnv = getEnvVar('NODE_ENV', 'development');

  if (nodeEnv === 'production' && vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return nextAuthUrl;
};

const domain = getBaseUrl();
const fromEmail = 'onboarding@resend.dev';

if (!domain) {
  throw new Error('Application URL is not set');
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    // Set a timeout of 8 seconds to ensure we don't hit the Vercel function timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out')), 8000);
    });

    const verificationUrl = `${domain}/api/auth/verify-email?token=${token}`;

    const emailPromise = resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Auth App!</h2>
          <p style="color: #666; line-height: 1.5;">
            Thank you for signing up. Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #0070f3; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; line-height: 1.5;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #666; line-height: 1.5;">
            Or copy and paste this URL into your browser:<br>
            <span style="color: #0070f3;">${verificationUrl}</span>
          </p>
        </div>
      `,
    });

    // Race between the email sending and the timeout
    await Promise.race([emailPromise, timeoutPromise])
      .catch((error) => {
        console.error('Failed to send verification email:', error);
        // Don't throw the error to prevent blocking the sign-up process
      });

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Don't throw the error to prevent blocking the sign-up process
    return false;
  }
} 