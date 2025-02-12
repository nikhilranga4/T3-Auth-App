"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "~/components/ui/use-toast";
import Link from "next/link";
import { z } from "zod";

const signupSchema = z.object({
	name: z.string().min(1, "Name is required"),
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
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const validatedData = signupSchema.parse({ name, email, password, confirmPassword });
			setLoading(true);

			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: validatedData.name,
					email: validatedData.email,
					password: validatedData.password
				}),
			});

			const data = await response.json() as SignupResponse;

			if (!response.ok) {
				throw new Error(data.message ?? "Something went wrong");
			}

			toast({
				description: data.message ?? "Email verification is sent to your email. Please check.",
			});

			router.push("/signin");
		} catch (error) {
			const errorMessage = 
				error instanceof z.ZodError && error.errors[0]?.message
					? error.errors[0].message
					: error instanceof Error
						? error.message
						: "An unexpected error occurred";
			
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
			toast({
				title: "Error",
				description: "Failed to sign in with " + provider,
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-bold">Create an Account</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your full name"
								className="w-full"
							/>
						</div>
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
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm your password"
								className="w-full"
							/>
						</div>
						{error && <p className="text-sm text-red-500">{error}</p>}
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing Up...
								</>
							) : (
								"Sign Up"
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
							href="/signin"
							className="text-sm text-blue-600 hover:text-blue-500"
						>
							Already have an account? Sign In
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}