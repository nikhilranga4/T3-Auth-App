"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import Link from "next/link";
import { z } from "zod";
import { motion } from "framer-motion";
import { SocialLoginButton } from "~/components/SocialLoginButton";
import { PasswordInput } from "~/components/ui/password-input";
import { CustomToast } from "~/components/ui/custom-toast";

const signupSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(9, "Password must be at least 9 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

interface SignupResponse {
	message: string;
	userId?: string;
}

export default function SignUpPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const validatedData = signupSchema.parse({ email, password, confirmPassword });
			setLoading(true);

			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: email.split("@")[0],
					email: validatedData.email,
					password: validatedData.password
				}),
			});

			const data = await response.json() as SignupResponse;

			if (!response.ok) {
				let errorMessage = data.message ?? "Something went wrong";
				
				if (errorMessage === "User already exists") {
					errorMessage = "This email is already registered. Please sign in instead.";
				}
				
				throw new Error(errorMessage);
			}

			toast({
				title: "Account Created Successfully!",
				description: "Please check your email for verification instructions."
			});

			setTimeout(() => {
				router.push("/signin");
			}, 2000);
		} catch (error) {
			let errorMessage = "";
			
			if (error instanceof z.ZodError) {
				errorMessage = error.errors[0]?.message ?? "Invalid input";
			} else if (error instanceof Error) {
				errorMessage = error.message;
			} else {
				errorMessage = "An unexpected error occurred";
			}
			
			setError(errorMessage);
			
			toast({
				variant: "destructive",
				title: "Sign Up Failed",
				description: errorMessage
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSocialLogin = async (provider: "github" | "google") => {
		try {
			setSocialLoading(provider);
			toast({
				title: "Connecting...",
				description: `Setting up your account with ${provider === 'google' ? 'Google' : 'GitHub'}...`
			});
			
			await signIn(provider, { 
				callbackUrl: "/dashboard",
			});
		} catch (err) {
			toast({
				variant: "destructive",
				title: "Connection Failed",
				description: `Unable to connect with ${provider}. Please try a different method.`
			});
		} finally {
			setSocialLoading(null);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
			<div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:40px_40px]" />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-[440px] relative"
			>
				<div className="text-center mb-6">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 font-heading tracking-tight">
							Create Account
						</h1>
						<p className="mt-2.5 text-sm text-gray-600 dark:text-gray-300 font-sans">
							Join us today and get started with your personalized experience
						</p>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl rounded-2xl p-7 relative overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 dark:from-gray-700/50 to-transparent" />
					<div className="relative space-y-5">
						<div className="flex flex-col gap-3">
							<SocialLoginButton
								provider="google"
								onClick={() => handleSocialLogin("google")}
								isLoading={socialLoading === "google"}
							/>
							<SocialLoginButton
								provider="github"
								onClick={() => handleSocialLogin("github")}
								isLoading={socialLoading === "github"}
							/>
						</div>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-gray-200 dark:border-gray-700" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-sans">
									Or use email
								</span>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200 font-sans">
									Email
								</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email"
									className="h-10 bg-white/60 dark:bg-gray-900/60 font-sans dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-500"
									disabled={loading}
								/>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200 font-sans">
									Password
								</Label>
								<PasswordInput
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Create a password"
									className="h-10 bg-white/60 dark:bg-gray-900/60 font-sans dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-500"
									disabled={loading}
								/>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-200 font-sans">
									Confirm Password
								</Label>
								<PasswordInput
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm your password"
									className="h-10 bg-white/60 dark:bg-gray-900/60 font-sans dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-500"
									disabled={loading}
								/>
							</div>

							{error && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 font-sans"
								>
									{error}
								</motion.div>
							)}

							<Button
								type="submit"
								className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-400 hover:from-blue-500 hover:to-blue-300 dark:hover:from-blue-400 dark:hover:to-blue-300 text-white font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300 font-sans"
								disabled={loading}
							>
								{loading ? (
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Creating Account...</span>
									</div>
								) : (
									"Create Account"
								)}
							</Button>
						</form>
					</div>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400 font-sans"
				>
					Already have an account?{" "}
					<Link
						href="/signin"
						className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
					>
						Sign In
					</Link>
				</motion.p>
			</motion.div>

			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<motion.div
					initial={{ opacity: 0, rotate: 0 }}
					animate={{ opacity: 0.3, rotate: 12 }}
					transition={{ duration: 1.5, ease: "easeOut" }}
					className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-50 dark:from-blue-900/20 to-transparent"
				/>
				<motion.div
					initial={{ opacity: 0, rotate: 0 }}
					animate={{ opacity: 0.3, rotate: -12 }}
					transition={{ duration: 1.5, ease: "easeOut" }}
					className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-50 dark:from-indigo-900/20 to-transparent"
				/>
			</div>
		</div>
	);
}