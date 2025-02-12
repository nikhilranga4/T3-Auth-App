"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type PropsWithChildren } from "react";
import { Toaster } from "~/components/ui/toaster";

interface ProvidersProps {
  cookies: string;
}

export function Providers({ children, cookies }: PropsWithChildren<ProvidersProps>) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
} 