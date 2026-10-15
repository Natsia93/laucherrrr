import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-300">
      {/* Navbar Skeleton */}
      <nav className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-[#0a0a0a]/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded overflow-hidden">
            <Image 
              src="/logo/Logo_revou.png" 
              alt="Launcher OS-RevoU Logo" 
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <Skeleton className="h-6 w-24 hidden sm:block bg-neutral-100 dark:bg-neutral-800" />
        </div>
        <div className="flex items-center gap-4">
           <Skeleton className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800" />
           <Skeleton className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </nav>

      <main className="flex-1 px-6 md:px-10 py-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 bg-neutral-100 dark:bg-neutral-800" />
          <Skeleton className="h-4 w-96 max-w-full bg-neutral-100 dark:bg-neutral-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
              <Skeleton className="h-4 w-32 mb-4 bg-neutral-100 dark:bg-neutral-800" />
              <Skeleton className="h-8 w-16 bg-neutral-100 dark:bg-neutral-800" />
            </Card>
          ))}
        </div>

        <Card className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full bg-neutral-50 dark:bg-neutral-800" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                   <Skeleton className="h-10 w-10 flex-shrink-0 bg-neutral-50 dark:bg-neutral-800" />
                   <Skeleton className="h-10 w-full bg-neutral-50 dark:bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
