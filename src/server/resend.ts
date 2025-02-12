import { Resend } from 'resend';
import { env } from "~/env";

if (!env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

const resend = new Resend(env.RESEND_API_KEY);

// Always use NEXTAUTH_URL as the base URL
const domain = env.NEXTAUTH_URL;

if (!domain) {
  throw new Error('NEXTAUTH_URL is not set');
}

// Ensure we have a verified sender email
const fromEmail = 'onboarding@resend.dev';

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string
) => {
  if (!email || !token) {
    console.error('Missing required parameters:', { email, token });
    throw new Error('Email and token are required');
  }

  const verificationUrl = `${domain}/api/auth/verify-email?token=${token}`;
  
  try {
    // Log the attempt
    console.log({
      message: 'Attempting to send verification email',
      email,
      verificationUrl,
      domain,
      hasResendKey: !!env.RESEND_API_KEY,
      environment: env.NODE_ENV,
    });

    const { data, error } = await resend.emails.send({
      from: `Auth App <${fromEmail}>`,
      to: [email],
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Auth App${name ? `, ${name}` : ''}!</h2>
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
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            This email was sent from Auth App. If you did not sign up for an account,
            please ignore this email.
          </p>
        </div>
      `,
      text: `Welcome to Auth App${name ? `, ${name}` : ''}!\n\n` +
            `Please verify your email address by clicking this link: ${verificationUrl}\n\n` +
            `If you didn't create an account, you can safely ignore this email.`,
      tags: [{ name: 'category', value: 'verification' }]
    });

    if (error) {
      console.error('Resend API Error:', {
        error,
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
      });
      throw error;
    }

    console.log('Email sent successfully:', {
      messageId: data?.id,
      to: email,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    console.error('Failed to send verification email:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email,
      domain,
    });
    throw error;
  }
}; 