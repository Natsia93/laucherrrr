import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextTopLoader from 'nextjs-toploader';
import { MobileBottomNav } from "@/components/MobileBottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dekstorio AI - Asisten Kurikulum Merdeka",
  description: "Buat CP, ATP, Prosem, Prota, dan KKTP secara otomatis dengan AI.",
  icons: {
    icon: "/logo/Logo Hijau.svg",
  },
};

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import AppPreloader from "@/components/common/AppPreloader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${bricolage.variable} font-sans antialiased bg-[#f4f3ed] text-[#1a2315] dark:bg-[#080b06] dark:text-[#f4f3ed] min-h-screen transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppPreloader />
          <NextTopLoader color="#4d7537" showSpinner={false} shadow="0 0 10px #4d7537,0 0 5px #4d7537" />
          <NuqsAdapter>
            <MobileBottomNav />
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
