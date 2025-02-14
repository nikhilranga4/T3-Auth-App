"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type PropsWithChildren } from "react";
import { Toaster } from "~/components/ui/toaster";

type ProvidersProps = PropsWithChildren<{
  cookies: string;
}>;

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        forcedTheme={undefined}
        storageKey="auth-app-theme"
        themes={["light", "dark", "system"]}
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
} 