"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface GreetingHeaderProps {
  userName?: string;
}

function getInitialGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good night";
}

function getInitialDateString(): string {
  const now = new Date();
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const { data: session } = authClient.useSession();
  const [greeting, setGreeting] = useState(getInitialGreeting);
  const [dateString, setDateString] = useState(getInitialDateString);

  const rawName = userName || session?.user?.name || "Fiqiy";
  // Extract last name for greeting (e.g., "Muhammad Fiqiy" -> "Fiqiy")
  const nameParts = rawName.trim().split(/\s+/);
  const displayName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      setGreeting(getInitialGreeting());
      setDateString(getInitialDateString());
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pb-2">
      <div className="space-y-1">
        <h1
          suppressHydrationWarning
          className="text-3xl sm:text-4xl lg:text-[38px] font-lora font-medium tracking-tight text-neutral-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-neutral-200 dark:to-neutral-400/90 leading-tight inline-block"
        >
          {greeting}, {displayName}
        </h1>
        <p 
          suppressHydrationWarning 
          className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-normal"
        >
          {dateString}
        </p>
      </div>
    </div>
  );
}


