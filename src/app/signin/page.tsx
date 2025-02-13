"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import Link from "next/link";
import { SocialLoginButton } from "~/components/SocialLoginButton";
import { motion } from "framer-motion";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const isVerified = searchParams.get("verified") === "true";

	// Show success message if email was just verified
	useEffect(() => {
		if (isVerified) {
			toast({
				description: "Your email has been verified successfully. You can now sign in.",
				className: "bg-green-500 text-white",
			});
		}
	}, [isVerified]);

	const getErrorMessage = (error: string) => {
		switch (error) {
			case "Email and password required":
				return "Please enter both email and password";
			case "Invalid credentials":
				return "Incorrect password. Please try again";
			case "Please verify your email before signing in":
				return "Please verify your email before signing in. Check your inbox for the verification link";
			case "User not found":
				return "Email does not exist. Please sign up first";
			case "Please sign in with your social account":
				return "This email is registered with a social account. Please use Google or GitHub to sign in";
			default:
				return "Failed to sign in. Please try again";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (!email || !password) {
			setError("Please enter both email and password");
			setLoading(false);
			return;
		}

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				const errorMessage = getErrorMessage(result.error);
				setError(errorMessage);
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Success",
				description: "Signed in successfully!",
				className: "bg-green-500 text-white",
			});

			router.push("/dashboard");
		} catch (error) {
			const errorMessage = "An unexpected error occurred. Please try again later.";
			setError(errorMessage);
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSocialLogin = async (provider: "github" | "google") => {
		try {
			setSocialLoading(provider);
			await signIn(provider, { callbackUrl: "/dashboard" });
		} catch (err) {
			const errorMessage = `Unable to sign in with ${provider}. Please try again.`;
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setSocialLoading(null);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-50 to-blue-50 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
			<div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-md relative"
			>
				<div className="text-center mb-8">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
							Welcome Back
						</h1>
						<p className="mt-3 text-gray-600">
							Sign in to your account to continue your journey
						</p>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 relative overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent" />
					<div className="relative space-y-6">
						<div className="space-y-4">
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
								<span className="w-full border-t border-gray-200" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-4 text-gray-500">
									Or continue with email
								</span>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium text-gray-700">
									Email
								</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email"
									className="h-11 bg-white/60"
									disabled={loading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium text-gray-700">
									Password
								</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter your password"
									className="h-11 bg-white/60"
									disabled={loading}
								/>
							</div>

							{error && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-lg bg-red-50 p-4 text-sm text-red-600"
								>
									{error}
								</motion.div>
							)}

							<Button
								type="submit"
								className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all duration-300"
								disabled={loading}
							>
								{loading ? (
									<div className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Signing In...</span>
									</div>
								) : (
									"Sign In"
								)}
							</Button>
						</form>
					</div>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="mt-6 text-center text-sm text-gray-600"
				>
					Don&apos;t have an account?{" "}
					<Link
						href="/signup"
						className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
					>
						Create Account
					</Link>
				</motion.p>
			</motion.div>

			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-indigo-50 to-transparent opacity-30 transform rotate-12" />
				<div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-blue-50 to-transparent opacity-30 transform -rotate-12" />
			</div>
		</div>
	);
}