"use client";

import React, { useState } from "react";
import { 
  Mail, 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Send, 
  Inbox,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { SlackChannel } from "./types";

interface SlackEmailBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmailChannel: (newChannel: {
    name: string;
    emailAddress: string;
    topic: string;
  }) => void;
  onSimulateIncomingEmail: (emailData: {
    fromName: string;
    fromEmail: string;
    targetChannelId: string;
    subject: string;
    body: string;
  }) => void;
  existingEmailChannels: SlackChannel[];
}

export function SlackEmailBridgeModal({
  isOpen,
  onClose,
  onAddEmailChannel,
  onSimulateIncomingEmail,
  existingEmailChannels,
}: SlackEmailBridgeModalProps) {
  const [activeTab, setActiveTab] = useState<"connect" | "simulate">("connect");

  // Connect Form State
  const [channelName, setChannelName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [description, setDescription] = useState("");

  // Simulate Form State
  const [simChannelId, setSimChannelId] = useState(existingEmailChannels[0]?.id || "c-email-support");
  const [simFromName, setSimFromName] = useState("");
  const [simFromEmail, setSimFromEmail] = useState("");
  const [simSubject, setSimSubject] = useState("");
  const [simBody, setSimBody] = useState("");

  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreateEmailChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !emailAddress.trim()) return;

    onAddEmailChannel({
      name: channelName.trim().toLowerCase().replace(/\s+/g, "-"),
      emailAddress: emailAddress.trim(),
      topic: description.trim() || `📥 Synced with ${emailAddress}`,
    });

    onClose();
  };

  const handleTriggerSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    setTimeout(() => {
      onSimulateIncomingEmail({
        fromName: simFromName,
        fromEmail: simFromEmail,
        targetChannelId: simChannelId,
        subject: simSubject,
        body: simBody,
      });

      setIsSimulating(false);
      setSimSuccess(true);
      setTimeout(() => {
        setSimSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Email Bridge & Inbound Hub
              </h3>
              <p className="text-[11px] text-neutral-400">
                Integrasikan email klien & tim langsung ke channel chat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-xs">
          <button
            onClick={() => setActiveTab("simulate")}
            className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "simulate"
                ? "border-[#FFE500] text-neutral-950 dark:text-white bg-white dark:bg-[#161616]"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#D4A800] dark:text-[#FFE500]" />
            <span>Simulasi Email Masuk (Live Test)</span>
          </button>
          <button
            onClick={() => setActiveTab("connect")}
            className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "connect"
                ? "border-[#FFE500] text-neutral-950 dark:text-white bg-white dark:bg-[#161616]"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Hubungkan Alamat Email Baru</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === "simulate" ? (
            <form onSubmit={handleTriggerSimulation} className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 text-sky-900 dark:text-sky-300 text-[11.5px] leading-relaxed">
                💡 Fitur ini mensimulasikan email masuk dari klien/partner eksternal langsung ke channel inbox chat. Anda dapat langsung membalasnya di thread chat!
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Channel Tujuan (Email Bridge)
                </label>
                <select
                  value={simChannelId}
                  onChange={(e) => setSimChannelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                >
                  {existingEmailChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name} ({c.emailAddress})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Pengirim (mis. Budi Santoso)"
                    value={simFromName}
                    onChange={(e) => setSimFromName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Email Pengirim
                  </label>
                  <input
                    type="email"
                    placeholder="budi@klien.com"
                    value={simFromEmail}
                    onChange={(e) => setSimFromEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Subjek Email
                </label>
                <input
                  type="text"
                  placeholder="Subjek email atau perihal pesan..."
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Isi Pesan Email
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan isi pesan email yang masuk..."
                  value={simBody}
                  onChange={(e) => setSimBody(e.target.value)}
                  className="w-full p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full py-2.5 rounded-xl bg-[#FFE500] hover:bg-[#F2D700] text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {simSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 font-black" />
                      <span>Email Berhasil Masuk ke Channel!</span>
                    </>
                  ) : (
                    <>
                      <Send className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                      <span>{isSimulating ? "Mengirim Email ke Bridge..." : "Kirim Simulasi Email Masuk"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateEmailChannel} className="space-y-3">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nama Channel
                </label>
                <input
                  type="text"
                  placeholder="inbox-billing"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Alamat Email Yang Disinkronkan
                </label>
                <input
                  type="email"
                  placeholder="billing@perusahaan.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Topik / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  placeholder="Inbound faktur & konfirmasi pembayaran"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Hubungkan & Buat Channel Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
