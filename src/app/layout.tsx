import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { type PropsWithChildren } from "react";
import { Providers } from "./providers";
import { ClientLayout } from "./client-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Auth App",
  description: "Authentication app with user details management",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: PropsWithChildren) {
  const cookieStore = cookies();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`} suppressHydrationWarning>
        <Providers cookies={cookieStore.toString()}>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
