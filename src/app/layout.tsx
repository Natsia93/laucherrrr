import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

import {
  Bricolage_Grotesque,
  Inter,
  Lora,
  Outfit,
  Plus_Jakarta_Sans,
} from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Launcher OS - RevoU",
  description: "The intelligent operating system for modern execution.",
  icons: {
    icon: "/logo/Logo_revou.png",
    shortcut: "/logo/Logo_revou.png",
    apple: "/logo/Logo_revou.png",
  },
};

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${bricolage.variable} ${lora.variable} ${outfit.variable} ${jakarta.variable} font-sans antialiased bg-white text-neutral-900 dark:bg-[#0a0a0a] dark:text-[#f5f5f5] min-h-screen transition-colors duration-200`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
