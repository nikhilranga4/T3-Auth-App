"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type PropsWithChildren } from "react";
import { Toaster } from "~/components/ui/toaster";

type ProvidersProps = PropsWithChildren<{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cookies: string;
}>;

export function Providers({ children }: ProvidersProps) {
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