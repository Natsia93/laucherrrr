"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardNavbarActionsProps {
    user: {
        name: string;
        image?: string | null;
    };
}

export function DashboardNavbarActions({ user }: DashboardNavbarActionsProps) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-neutral-300 dark:bg-[#3f612d]/30 hidden md:block mx-1"></div>
            
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-medium text-neutral-500 hover:text-red-500 dark:text-[#a2b591] dark:hover:text-red-400"
                onClick={async () => {
                    await authClient.signOut();
                    router.push("/login");
                }}
            >
                Sign Out
            </Button>

            <Avatar className="w-8 h-8 border border-neutral-300 dark:border-[#3f612d]/40">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-neutral-100 dark:bg-[#1a2315] text-[#4d7537] text-[10px]">
                    {user.name?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
            </Avatar>
        </div>
    );
}
