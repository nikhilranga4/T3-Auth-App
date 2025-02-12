import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_APP_PASSWORD,
	},
});

export const sendVerificationEmail = async (email: string, token: string) => {
	const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`;

	await transporter.sendMail({
		from: process.env.GMAIL_USER,
		to: email,
		subject: "Verify your email",
		html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
	});
};

export const sendWelcomeEmail = async (email: string) => {
	await transporter.sendMail({
		from: process.env.GMAIL_USER,
		to: email,
		subject: "Welcome to AuthApp",
		html: `<p>Welcome to AuthApp! Your account has been successfully created.</p>`,
	});
};