import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since the URL will be known at deploy time
      (str) => process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : str,
      z.string().url(),
    ),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
    AUTH_SECRET: process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().optional(),
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    GITHUB_ID: z.string(),
    GITHUB_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    VERCEL_URL: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    VERCEL_URL: process.env.VERCEL_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

