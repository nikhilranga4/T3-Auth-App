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

export async function sendVerificationEmail(email: string, userId: string) {
  try {
    // Set a timeout of 8 seconds to ensure we don't hit the Vercel function timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out')), 8000);
    });

    const emailPromise = resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to Our App - Please Verify Your Email',
      html: `
        <p>Welcome to our app!</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${userId}">
          Verify Email
        </a>
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