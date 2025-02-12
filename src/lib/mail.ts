import nodemailer from 'nodemailer';
import { env } from "~/env.mjs";

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		type: 'OAuth2',
		user: env.GMAIL_USER,
		clientId: env.GMAIL_CLIENT_ID,
		clientSecret: env.GMAIL_CLIENT_SECRET,
		refreshToken: env.GMAIL_REFRESH_TOKEN,
		accessToken: env.GMAIL_ACCESS_TOKEN,
	},
});

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
	const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
	
	await transporter.sendMail({
		from: env.GMAIL_USER,
		to: email,
		subject: 'Verify your email address',
		html: `
			<h1>Welcome to Our App!</h1>
			<p>Please verify your email address by clicking the link below:</p>
			<a href="${verificationUrl}">Verify Email</a>
		`,
	});
};

export const sendWelcomeEmail = async (email: string, name: string) => {
	await transporter.sendMail({
		from: env.GMAIL_USER,
		to: email,
		subject: 'Welcome to Our App!',
		html: `
			<h1>Welcome ${name}!</h1>
			<p>Thank you for joining our platform. We're excited to have you on board!</p>
		`,
	});
};