import { Inter, Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Auth App",
  description: "Authentication app with user details management",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body 
        className={`${inter.variable} ${poppins.variable} font-sans min-h-screen bg-background text-foreground antialiased selection:bg-blue-500/10 dark:selection:bg-blue-500/20`}
        suppressHydrationWarning
      >
        <Providers cookies={cookieStore.toString()}>
          <div className="relative flex min-h-screen flex-col">
            <div className="fixed right-4 top-4 z-50">
            </div>
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
