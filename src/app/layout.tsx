import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextTopLoader from 'nextjs-toploader';
import { MobileBottomNav } from "@/components/MobileBottomNav";

const sfPro = localFont({
  src: [
    {
      path: "../fonts/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-Medium.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-sf",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body suppressHydrationWarning className={`${sfPro.variable} font-sans antialiased bg-white text-neutral-900 dark:bg-[#0a0a0a] dark:text-[#f5f5f5] min-h-screen transition-colors duration-200`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#FFD100" showSpinner={false} shadow="0 0 10px #FFD100,0 0 5px #FFD100" />
          <NuqsAdapter>
            <SidebarProvider>
              <MobileBottomNav />
              {children}
            </SidebarProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
