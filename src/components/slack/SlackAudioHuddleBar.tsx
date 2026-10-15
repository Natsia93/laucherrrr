"use client";

import React, { useState } from "react";
import { 
  Headphones, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Volume2, 
  Users, 
  Radio 
} from "lucide-react";
import { SlackUser } from "./types";

interface SlackAudioHuddleBarProps {
  isActive: boolean;
  channelName: string;
  currentUser: SlackUser;
  onLeave: () => void;
}

export function SlackAudioHuddleBar({
  isActive,
  channelName,
  currentUser,
  onLeave,
}: SlackAudioHuddleBarProps) {
  const [isMuted, setIsMuted] = useState(false);

  if (!isActive) return null;

  return (
    <div className="absolute bottom-4 left-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="p-3 rounded-2xl bg-neutral-900 text-white dark:bg-[#1c1c1c] dark:text-neutral-100 border border-neutral-700 dark:border-neutral-700 shadow-2xl flex items-center gap-3">
        {/* Animated Waveform */}
        <div className="flex items-center gap-1 px-1">
          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: "0ms" }} />
          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-6" style={{ animationDelay: "150ms" }} />
          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: "300ms" }} />
          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-5" style={{ animationDelay: "75ms" }} />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Huddle in #{channelName}</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">
            1 orang terhubung ({currentUser.name})
          </p>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Leave Button */}
          <button
            onClick={onLeave}
            title="Tinggalkan Huddle"
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
