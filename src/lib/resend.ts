import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error('Missing NEXTAUTH_URL environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXTAUTH_URL;
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// In development/testing, we can only send to the verified email
const VERIFIED_EMAIL = 'nikhilranga43@gmail.com';

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string
) => {
  const verificationUrl = `${domain}/api/auth/verify-email?token=${token}`;
  
  try {
    console.log('Sending verification email to:', email);
    console.log('Verification URL:', verificationUrl);
    
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
        </div>
      `,
      text: `Welcome to Auth App${name ? `, ${name}` : ''}!\n\n` +
            `Please verify your email address by clicking this link: ${verificationUrl}\n\n` +
            `If you didn't create an account, you can safely ignore this email.`,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }

    console.log('Verification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}; 