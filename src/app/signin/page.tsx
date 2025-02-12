"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import Link from "next/link";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const isVerified = searchParams.get("verified") === "true";

	// Show success message if email was just verified
	useEffect(() => {
		if (isVerified) {
			toast({
				description: "Your email has been verified successfully. You can now sign in.",
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
					description: errorMessage,
					variant: "destructive",
				});
				return;
			}

			router.push("/dashboard");
		} catch (error) {
			const errorMessage = "An unexpected error occurred. Please try again later.";
			setError(errorMessage);
			toast({
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSocialLogin = async (provider: "github" | "google") => {
		try {
			await signIn(provider, { callbackUrl: "/dashboard" });
		} catch (err) {
			const errorMessage = `Unable to sign in with ${provider}. Please try again.`;
			toast({
				description: errorMessage,
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-bold">Sign In</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								className="w-full"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								className="w-full"
							/>
						</div>
						{error && (
							<div className="rounded-md bg-destructive/15 p-3">
								<p className="text-sm text-destructive">{error}</p>
							</div>
						)}
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing In...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="bg-white px-2 text-gray-500">Or continue with</span>
							</div>
						</div>

						<div className="mt-6 grid grid-cols-2 gap-3">
							<Button
								variant="outline"
								onClick={() => handleSocialLogin("github")}
								className="w-full"
							>
								GitHub
							</Button>
							<Button
								variant="outline"
								onClick={() => handleSocialLogin("google")}
								className="w-full"
							>
								Google
							</Button>
						</div>
					</div>

					<div className="mt-4 text-center">
						<Link
							href="/signup"
							className="text-sm text-blue-600 hover:text-blue-500"
						>
							Don't have an account? Sign Up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}