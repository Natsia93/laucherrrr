"use client";

import React, { useState } from "react";
import { Hash, Lock, X, Plus } from "lucide-react";

interface SlackNewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channelData: {
    name: string;
    topic: string;
    description: string;
    isPrivate: boolean;
  }) => void;
}

export function SlackNewChannelModal({
  isOpen,
  onClose,
  onCreateChannel,
}: SlackNewChannelModalProps) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateChannel({
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      topic: topic.trim(),
      description: description.trim(),
      isPrivate: isPrivate,
    });

    setName("");
    setTopic("");
    setDescription("");
    setIsPrivate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFE500]/20 text-neutral-950 dark:text-[#FFE500] flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Buat Channel Baru
              </h3>
              <p className="text-[11px] text-neutral-400">
                Ruang diskusi topik khusus untuk tim
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Nama Channel
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-neutral-400 font-bold">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="project-alpha"
                className="w-full pl-7 pr-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Topik Diskusi
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Diskusi sprint mingguan & integrasi API"
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Deskripsi (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan tujuan channel ini..."
              className="w-full p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FFE500] resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Jadikan Channel Privat
              </p>
              <p className="text-[10.5px] text-neutral-400">
                Hanya anggota yang diundang yang dapat mengakses
              </p>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-[#FFE500] rounded focus:ring-[#FFE500] cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FFE500] hover:bg-[#F2D700] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Channel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
