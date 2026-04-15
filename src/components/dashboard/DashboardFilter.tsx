"use client";

import React from "react";
import { Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { label: "Alur Tujuan Pembelajaran (ATP)", value: "ATP" },
  { label: "Capaian Pembelajaran (CP)", value: "CP" },
  { label: "Program Tahunan (PROTA)", value: "PROTA" },
  { label: "Program Semester (PROSEM)", value: "PROSEM" },
  { label: "LKPD", value: "LKPD" },
  { label: "KKTP", value: "KKTP" },
];

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const setCategory = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  const currentLabel = CATEGORIES.find(c => (typeof c === 'string' ? c : c.value) === currentCategory);
  const labelText = currentLabel 
    ? (typeof currentLabel === 'string' ? currentLabel : currentLabel.value) 
    : "Filter";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white dark:bg-[#10140d]/80 border border-[#dcdad1] dark:border-[#3f612d]/30 text-neutral-700 dark:text-[#d4e4c8] hover:bg-neutral-50 dark:hover:bg-[#1a2315] hover:text-neutral-900 dark:hover:text-white cursor-pointer h-10 px-4">
        <Filter className="w-4 h-4 mr-2 text-[#4d7537] dark:text-[#89b867]" />
        {currentCategory ? labelText : "Filter"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-[#10140d] border-[#dcdad1] dark:border-[#3f612d]/30 text-neutral-900 dark:text-[#f4f3ed]">
        <DropdownMenuLabel className="font-sans text-xs text-neutral-500 uppercase tracking-widest">Kategori Dokumen</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-100 dark:bg-[#3f612d]/10" />
        <DropdownMenuItem 
          onClick={() => setCategory(null)}
          className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1a2315]"
        >
          <div className="flex items-center justify-between w-full font-sans">
            Semua Dokumen
            {!currentCategory && <Check className="w-4 h-4 text-[#4d7537]" />}
          </div>
        </DropdownMenuItem>
        {CATEGORIES.map((cat) => {
          const label = typeof cat === 'string' ? cat : cat.label;
          const value = typeof cat === 'string' ? cat : cat.value;
          
          return (
            <DropdownMenuItem 
              key={value} 
              onClick={() => setCategory(value)}
              className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1a2315]"
            >
              <div className="flex items-center justify-between w-full font-sans">
                {label}
                {currentCategory === value && <Check className="w-4 h-4 text-[#4d7537]" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
