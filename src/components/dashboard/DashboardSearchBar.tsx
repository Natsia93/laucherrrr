"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export function DashboardSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("search", debouncedQuery);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard?${params.toString()}`);
  }, [debouncedQuery, router, searchParams]);

  return (
    <div className="relative hidden xl:block">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-[#6b7b59]" />
      <Input 
        placeholder="Cari dokumen..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-48 xl:w-64 pl-9 bg-white dark:bg-[#1a2315]/50 border-[#dcdad1] dark:border-[#3f612d]/30 text-sm focus-visible:ring-[#4d7537]/50 text-neutral-900 dark:text-[#f4f3ed] placeholder:text-neutral-400 dark:placeholder:text-[#6b7b59]"
      />
    </div>
  );
}
