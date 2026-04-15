"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQueryState, parseAsString } from "nuqs";

export function DashboardSearchBar() {
  const [query, setQuery] = useQueryState("search", parseAsString.withDefault("").withOptions({
    shallow: true,
    throttleMs: 300
  }));

  return (
    <div className="relative hidden xl:block">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-[#6b7b59]" />
      <Input 
        placeholder="Cari dokumen..." 
        value={query || ""}
        onChange={(e) => setQuery(e.target.value)}
        className="w-48 xl:w-64 pl-9 bg-white dark:bg-[#1a2315]/50 border-[#dcdad1] dark:border-[#3f612d]/30 text-sm focus-visible:ring-[#4d7537]/50 text-neutral-900 dark:text-[#f4f3ed] placeholder:text-neutral-400 dark:placeholder:text-[#6b7b59]"
      />
    </div>
  );
}
