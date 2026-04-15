"use client";

import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

// The fixed sequence requested by the USER
const SEQUENCE = [
  "LKPD",
  "ATP",
  "CP",
  "KKTP",
  "PROSEM",
  "PROTA",
  null // null represents "Semua / All"
];

interface DashboardFilterProps {
  availableCategories: string[];
}

export function DashboardFilter({ availableCategories }: DashboardFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const cycleToNextCategory = () => {
    // Current index in our sequence
    const currentIndex = SEQUENCE.indexOf(currentCategory as any);
    let nextIndex = (currentIndex + 1) % SEQUENCE.length;

    // Smart Skip Logic: Cycle until we find an available category or reach "All"
    // We try at most SEQUENCE.length times to avoid infinite loop
    let attempts = 0;
    while (attempts < SEQUENCE.length) {
      const nextCat = SEQUENCE[nextIndex];
      
      // If next is "All" (null), it's always available
      if (nextCat === null) break;
      
      // If nextCat is in our available list, we found it
      if (availableCategories.includes(nextCat)) break;
      
      // Otherwise, move to next and try again
      nextIndex = (nextIndex + 1) % SEQUENCE.length;
      attempts++;
    }

    const finalNextCat = SEQUENCE[nextIndex];
    const params = new URLSearchParams(searchParams.toString());
    
    if (finalNextCat) {
      params.set("category", finalNextCat);
    } else {
      params.delete("category");
    }
    
    router.push(`/dashboard?${params.toString()}`);
  };

  // Label display
  const labelText = currentCategory ? currentCategory : "Semua";

  return (
    <Button 
      onClick={cycleToNextCategory}
      variant="outline" 
      className="bg-white dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 text-neutral-700 dark:text-[#d4e4c8] hover:bg-neutral-50 dark:hover:bg-[#1a2315] hover:text-neutral-900 dark:hover:text-white cursor-pointer h-10 px-4 transition-all active:scale-95 flex items-center gap-2 group"
    >
      <div className="relative">
        <Filter className="w-4 h-4 text-[#4d7537] dark:text-[#89b867] group-hover:rotate-12 transition-transform" />
        {currentCategory && (
           <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#4d7537] rounded-full" />
        )}
      </div>
      <span className="font-sans text-sm">
        Filter: <span className="font-bold text-[#4d7537] dark:text-[#89b867]">{labelText}</span>
      </span>
    </Button>
  );
}
