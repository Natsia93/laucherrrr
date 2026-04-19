"use client";

import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryState, parseAsString } from "nuqs";

// Normalized sequence with fallbacks
const SEQUENCE: { id: string | null; matches: string[] }[] = [
  { id: "LKPD", matches: ["LKPD"] },
  { id: "ATP", matches: ["ATP", "Alur Tujuan Pembelajaran (ATP)"] },
  { id: "CP", matches: ["CP", "Capaian Pembelajaran (CP)"] },
  { id: "KKTP", matches: ["KKTP"] },
  { id: "PROSEM", matches: ["PROSEM", "Program Semester"] },
  { id: "PROTA", matches: ["PROTA", "Program Tahunan"] },
  { id: "KISI-KISI", matches: ["KISI-KISI", "Desain Evaluasi", "ASESMEN"] },
  { id: null, matches: [] } // null represents "Semua / All"
];

interface DashboardFilterProps {
  availableCategories: string[];
}

export function DashboardFilter({ availableCategories }: DashboardFilterProps) {
  const [currentCategory, setCurrentCategory] = useQueryState("category", parseAsString.withOptions({
    shallow: true
  }));

  const cycleToNextCategory = () => {
    // Current index based on matching the current category value
    const currentIndex = SEQUENCE.findIndex(s => s.matches.includes(currentCategory as string) || (s.id === null && currentCategory === null));
    let nextIndex = (currentIndex + 1) % SEQUENCE.length;

    let attempts = 0;
    while (attempts < SEQUENCE.length) {
      const nextItem = SEQUENCE[nextIndex];
      
      // If next is "All" (null), it's always available
      if (nextItem.id === null) break;
      
      // Smart Check: Does user have any document that matches any of the item's labels?
      const isAvailable = nextItem.matches.some(m => availableCategories.includes(m));
      if (isAvailable) break;
      
      // Otherwise, move to next and try again
      nextIndex = (nextIndex + 1) % SEQUENCE.length;
      attempts++;
    }

    const finalNextItem = SEQUENCE[nextIndex];
    setCurrentCategory(finalNextItem.id);
  };

  // Label display logic
  const labelText = (currentCategory === "KISI-KISI" || currentCategory === "Desain Evaluasi") 
    ? "ASESMEN" 
    : (currentCategory || "Semua");

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
