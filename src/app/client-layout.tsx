"use client";

import { type PropsWithChildren } from "react";
import { Toaster } from "~/components/ui/toaster";

export function ClientLayout({ children }: PropsWithChildren) {
  return (
    <>
      <main className="relative flex min-h-screen flex-col">
        {children}
      </main>
      <Toaster />
    </>
  );
} 