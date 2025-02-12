"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type PropsWithChildren } from "react";
import { Toaster } from "~/components/ui/toaster";
import { TRPCReactProvider } from "~/trpc/react";

interface ProvidersProps {
  cookies: string;
}

export function Providers({ children, cookies }: PropsWithChildren<ProvidersProps>) {
  return (
    <TRPCReactProvider cookies={cookies}>
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
    </TRPCReactProvider>
  );
} 