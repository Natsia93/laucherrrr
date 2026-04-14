import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function WorkspaceLoading() {
  return (
    <div className="h-screen flex flex-col bg-[#f4f3ed] dark:bg-[#080b06] overflow-hidden">
      {/* Nav Skeleton */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#dcdad1] dark:border-[#3f612d]/20 bg-white dark:bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-[#1a2315]" />
          <Skeleton className="h-6 w-32 bg-neutral-100 dark:bg-[#1a2315]" />
        </div>
        <div className="flex items-center gap-2">
           <Skeleton className="h-8 w-24 rounded-full bg-neutral-100 dark:bg-[#1a2315]" />
           <Skeleton className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-[#1a2315]" />
           <Skeleton className="h-8 w-32 rounded-md bg-neutral-100 dark:bg-[#1a2315]" />
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Document Skeleton */}
        <div className="flex-1 p-6 md:p-10 flex flex-col items-center bg-[#e5e5e0] dark:bg-[#050704]/50 overflow-y-auto">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl p-[25mm] border border-neutral-200">
             <div className="flex flex-col items-center justify-center h-full space-y-8 mt-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#4d7537] opacity-20" />
                <div className="space-y-4 w-full">
                   <Skeleton className="h-10 w-3/4 mx-auto bg-neutral-100" />
                   <Skeleton className="h-4 w-5/6 mx-auto bg-neutral-100" />
                   <Skeleton className="h-4 w-4/6 mx-auto bg-neutral-100" />
                </div>
                <div className="w-full pt-10 grid grid-cols-2 gap-4">
                   <Skeleton className="h-48 w-full bg-neutral-50" />
                   <Skeleton className="h-48 w-full bg-neutral-50" />
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="hidden md:flex w-[350px] lg:w-[420px] border-l border-[#dcdad1] dark:border-[#3f612d]/30 bg-white dark:bg-[#0a0a0a] flex-col p-6 space-y-6">
           <Skeleton className="h-8 w-1/2 bg-neutral-100 dark:bg-[#1a2315]" />
           <div className="space-y-4 flex-1">
              {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-[#1a2315]" />
                    <Skeleton className="h-10 w-full bg-neutral-50 dark:bg-[#1a2315]" />
                 </div>
              ))}
           </div>
           <Skeleton className="h-12 w-full rounded-xl bg-neutral-50 dark:bg-[#1a2315]" />
        </div>
      </main>
    </div>
  );
}
