"use client";

import React, { useState } from "react";
import { 
  Hash, 
  Lock, 
  Mail, 
  Users, 
  X, 
  Copy, 
  Check, 
  Info, 
  ShieldCheck, 
  Sparkles,
  ExternalLink 
} from "lucide-react";
import { SlackChannel, SlackUser } from "./types";
interface SlackChannelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: SlackChannel;
  currentUser: SlackUser;
}

export function SlackChannelDetailsModal({
  isOpen,
  onClose,
  channel,
  currentUser,
}: SlackChannelDetailsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "members">("about");

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    if (!channel.emailAddress) return;
    navigator.clipboard.writeText(channel.emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const membersList = [currentUser];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center font-bold">
              {channel.type === "email" ? (
                <Mail className="w-4 h-4 text-sky-500" />
              ) : channel.isPrivate ? (
                <Lock className="w-4 h-4 text-amber-500" />
              ) : (
                <Hash className="w-4 h-4 text-neutral-500" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                #{channel.name}
              </h3>
              <p className="text-xs text-neutral-400">
                {channel.isEmailBridge ? "Email Bridge Channel" : "Team Collaboration Channel"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-5 border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("about")}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "about"
                ? "border-[#FFE500] text-neutral-950 dark:text-white font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Tentang Channel
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "members"
                ? "border-[#FFE500] text-neutral-950 dark:text-white font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Anggota ({channel.membersCount || membersList.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {activeTab === "about" ? (
            <div className="space-y-4">
              {/* Topic Box */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Topik Diskusi</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {channel.topic || "Ruang kolaborasi tim Launcher OS"}
                </p>
              </div>

              {/* Description Box */}
              {channel.description && (
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Deskripsi</span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {channel.description}
                  </p>
                </div>
              )}

              {/* Email Bridge Section if available */}
              {channel.isEmailBridge && channel.emailAddress && (
                <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      Inbound Email Address
                    </span>
                    <button
                      onClick={handleCopyEmail}
                      className="px-2 py-1 rounded-md bg-white dark:bg-[#161616] text-sky-800 dark:text-sky-300 hover:bg-sky-100 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-sky-200 dark:border-sky-700"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEmail ? "Tersalin!" : "Salin Email"}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs font-bold text-sky-950 dark:text-sky-200 bg-white/70 dark:bg-black/30 p-2 rounded-lg border border-sky-200/60 dark:border-sky-800">
                    {channel.emailAddress}
                  </p>
                  <p className="text-[11px] text-sky-800/80 dark:text-sky-400">
                    Email yang dikirim ke alamat ini akan otomatis disalurkan ke pesan channel secara real-time.
                  </p>
                </div>
              )}

              {/* Security & Access */}
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Enkripsi pesan & webhook terverifikasi di Launcher OS.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {membersList.map((mem) => (
                <div
                  key={mem.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={mem.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={mem.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                        {mem.name} {mem.id === currentUser.id ? "(Anda)" : ""}
                      </p>
                      <p className="text-[11px] text-neutral-400">{mem.role || "Member"}</p>
                    </div>
                  </div>

                  <span className={`w-2 h-2 rounded-full ${mem.status === "online" ? "bg-emerald-500" : "bg-neutral-400"}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
