import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Lora, Plus_Jakarta_Sans, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextTopLoader from 'nextjs-toploader';
import { MobileBottomNav } from "@/components/MobileBottomNav";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
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
      <body suppressHydrationWarning className={`${lora.variable} ${sfPro.variable} ${inter.variable} ${bricolage.variable} ${plusJakartaSans.variable} ${outfit.variable} font-sans antialiased bg-white text-neutral-900 dark:bg-[#0a0a0a] dark:text-[#f5f5f5] min-h-screen transition-colors duration-200`}>
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
