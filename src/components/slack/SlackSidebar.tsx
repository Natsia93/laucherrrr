"use client";

import React, { useState } from "react";
import { 
  Hash, 
  Lock, 
  Mail, 
  MessageSquare, 
  Plus, 
  Search, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  Circle,
  Radio,
  SlidersHorizontal,
  Bot
} from "lucide-react";
import { SlackChannel, SlackUser } from "./types";

interface SlackSidebarProps {
  channels: SlackChannel[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  currentUser: SlackUser;
  onOpenNewChannelModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenEmailBridgeModal: () => void;
}

export function SlackSidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  currentUser,
  onOpenNewChannelModal,
  onOpenSettingsModal,
  onOpenEmailBridgeModal,
}: SlackSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [emailsOpen, setEmailsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

  // Group channels by category
  const regularChannels = channels.filter((c) => c.type === "channel");
  const emailChannels = channels.filter((c) => c.type === "email");
  const dmChannels = channels.filter((c) => c.type === "dm");

  const filterItem = (name: string, topic?: string) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || (topic && topic.toLowerCase().includes(q));
  };

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col h-full bg-white dark:bg-[#121212] border-r border-neutral-200/80 dark:border-neutral-800 select-none">
      {/* Workspace Header */}
      <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FFE500] text-neutral-950 font-black text-xs flex items-center justify-center shadow-xs shrink-0">
            LOS
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5 leading-tight">
              Launcher OS Hub
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            </h2>
            <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 truncate">
              RevoU Family Workspace
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettingsModal}
          title="Workspace & Webhook Settings"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Search in Channels */}
      <div className="p-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari channel, DM, inbox..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg text-xs bg-neutral-100/70 dark:bg-neutral-900/70 text-neutral-900 dark:text-white placeholder:text-neutral-400 border border-transparent focus:border-[#FFE500] focus:bg-white dark:focus:bg-[#161616] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Channels List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1.5 text-xs">
        {/* Section: Channels */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <button
              onClick={() => setChannelsOpen(!channelsOpen)}
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {channelsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Channels ({regularChannels.length})</span>
            </button>
            <button
              onClick={onOpenNewChannelModal}
              title="Buat Channel Baru"
              className="p-0.5 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {channelsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {regularChannels.filter((c) => filterItem(c.name, c.topic)).map((ch) => {
                const isActive = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChannel(ch.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${
                      isActive
                        ? "bg-[#FFE500]/15 dark:bg-[#FFE500]/20 text-neutral-950 dark:text-white font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {ch.isPrivate ? (
                        <Lock className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-neutral-950 dark:text-[#FFE500]" : "text-neutral-400"}`} />
                      ) : (
                        <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-neutral-950 dark:text-[#FFE500]" : "text-neutral-400"}`} />
                      )}
                      <span className="truncate text-xs">{ch.name}</span>
                    </div>

                    {(ch.unreadCount || 0) > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FFE500] text-neutral-950 shrink-0">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Email Bridge Inboxes */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <button
              onClick={() => setEmailsOpen(!emailsOpen)}
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {emailsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span className="flex items-center gap-1">
                Email Bridges ({emailChannels.length})
              </span>
            </button>
            <button
              onClick={onOpenEmailBridgeModal}
              title="Hubungkan Email Baru"
              className="p-0.5 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {emailsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {emailChannels.filter((c) => filterItem(c.name, c.topic)).map((ch) => {
                const isActive = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChannel(ch.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${
                      isActive
                        ? "bg-[#FFE500]/15 dark:bg-[#FFE500]/20 text-neutral-950 dark:text-white font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#D4A800] dark:text-[#FFE500]" : "text-amber-500"}`} />
                      <span className="truncate text-xs">{ch.name}</span>
                    </div>

                    {(ch.unreadCount || 0) > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FFE500] text-neutral-950 shrink-0">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Direct Messages */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <button
              onClick={() => setDmsOpen(!dmsOpen)}
              className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {dmsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Direct Messages ({dmChannels.length})</span>
            </button>
          </div>

          {dmsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {dmChannels.length === 0 ? (
                <div className="px-2.5 py-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                  Belum ada pesan langsung aktif
                </div>
              ) : (
                dmChannels.filter((c) => filterItem(c.name, c.topic)).map((ch) => {
                  const isActive = ch.id === activeChannelId;
                  const partner = ch.partnerUser;
                  const isOnline = partner?.status === "online";
                  const isBot = partner?.isBot;

                  return (
                    <button
                      key={ch.id}
                      onClick={() => onSelectChannel(ch.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${
                        isActive
                          ? "bg-[#FFE500]/15 dark:bg-[#FFE500]/20 text-neutral-950 dark:text-white font-semibold"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          {isBot ? (
                            <div className="w-4 h-4 rounded-full bg-neutral-900 text-[#FFE500] flex items-center justify-center">
                              <Bot className="w-3 h-3" />
                            </div>
                          ) : (
                            <img
                              src={partner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                              alt={ch.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                          )}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-[#121212] ${
                              isOnline ? "bg-emerald-500" : "bg-neutral-400"
                            }`}
                          />
                        </div>
                        <span className="truncate text-xs">{ch.name}</span>
                      </div>

                      {(ch.unreadCount || 0) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FFE500] text-neutral-950 shrink-0">
                          {ch.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current User Status & Bar */}
      <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#121212]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Aktif & Siap Kolaborasi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
