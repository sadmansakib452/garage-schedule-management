import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Garage Setup Dashboard - MOT Test App",
  description: "Configure your garage scheduling system for MOT tests",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="garage-theme"
        >
          <div suppressHydrationWarning>
            {children}
            <div suppressHydrationWarning>
              <Toaster />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
