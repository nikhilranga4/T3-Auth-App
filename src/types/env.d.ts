declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXTAUTH_URL: string;
    RESEND_API_KEY: string;
    DATABASE_URL: string;
    DIRECT_URL: string;
    AUTH_SECRET: string;
    GITHUB_ID: string;
    GITHUB_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
} 