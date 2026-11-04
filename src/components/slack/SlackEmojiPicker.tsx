"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, X, Smile, Sparkles, ThumbsUp, Heart, Briefcase, Zap } from "lucide-react";

export interface EmojiItem {
  emoji: string;
  name: string;
  category: "popular" | "smileys" | "gestures" | "work" | "symbols";
}

export const EMOJI_DATABASE: EmojiItem[] = [
  // Popular
  { emoji: "👍", name: "thumbs up jempol ok sip", category: "popular" },
  { emoji: "❤️", name: "love hati merah suka", category: "popular" },
  { emoji: "🔥", name: "fire api keren mantap", category: "popular" },
  { emoji: "🚀", name: "rocket roket launch meluncur", category: "popular" },
  { emoji: "🎉", name: "party popper selamat hore perayaan", category: "popular" },
  { emoji: "👀", name: "eyes mata lihat kepo cek", category: "popular" },
  { emoji: "✅", name: "check centang done selesai siap", category: "popular" },
  { emoji: "⚡", name: "lightning petir kilat cepat", category: "popular" },
  { emoji: "💯", name: "hundred seratus sempurna nilai", category: "popular" },
  { emoji: "🙌", name: "raising hands tos angkat tangan hore", category: "popular" },
  { emoji: "👏", name: "clapping tepuk tangan apresiasi", category: "popular" },
  { emoji: "💡", name: "idea lampu ide gagasan", category: "popular" },

  // Smileys & Emotions
  { emoji: "😀", name: "grinning senyum tertawa", category: "smileys" },
  { emoji: "😂", name: "joy ngakak tertawa menangis", category: "smileys" },
  { emoji: "🤣", name: "rofl guling ngakak lucu", category: "smileys" },
  { emoji: "😍", name: "heart eyes cinta suka jatuh cinta", category: "smileys" },
  { emoji: "🥳", name: "partying pesta topi trompet", category: "smileys" },
  { emoji: "😎", name: "sunglasses kacamata keren santai", category: "smileys" },
  { emoji: "🤔", name: "thinking berpikir mikir bingung", category: "smileys" },
  { emoji: "🤩", name: "star struck bintang kagum wow", category: "smileys" },
  { emoji: "🤯", name: "exploding head kaget meledak kaget", category: "smileys" },
  { emoji: "😇", name: "halo malaikat suci baik", category: "smileys" },
  { emoji: "🤗", name: "hugging peluk ramah hangat", category: "smileys" },
  { emoji: "🤫", name: "shushing rahasia diam sst", category: "smileys" },
  { emoji: "🫡", name: "saluting hormat siap komandan", category: "smileys" },
  { emoji: "😴", name: "sleeping tidur ngantuk istirahat", category: "smileys" },
  { emoji: "🫠", name: "melting meleleh pusing pasrah", category: "smileys" },

  // Gestures & Hands
  { emoji: "👎", name: "thumbs down tidak setuju kurang", category: "gestures" },
  { emoji: "🤝", name: "handshake jabat tangan deal sepakat", category: "gestures" },
  { emoji: "✌️", name: "peace damai dua jari menang", category: "gestures" },
  { emoji: "🤞", name: "crossed fingers semoga beruntung doa", category: "gestures" },
  { emoji: "🤟", name: "love you cinta metal tiga jari", category: "gestures" },
  { emoji: "👊", name: "fist bump tinju salam tos", category: "gestures" },
  { emoji: "💪", name: "muscle otot kuat semangat tenaga", category: "gestures" },
  { emoji: "🙏", name: "praying tolong terima kasih maaf doa", category: "gestures" },
  { emoji: "👋", name: "waving lambaian dadah halo hai", category: "gestures" },
  { emoji: "🤌", name: "pinched fingers apa maksud mantap chef", category: "gestures" },
  { emoji: "✍️", name: "writing menulis tanda tangan catat", category: "gestures" },

  // Work & Productivity
  { emoji: "💼", name: "briefcase koper kerja kantor proyek", category: "work" },
  { emoji: "💻", name: "laptop komputer coding kerja tech", category: "work" },
  { emoji: "📱", name: "phone handphone hp kontak telepon", category: "work" },
  { emoji: "📊", name: "bar chart grafik data analitik metrik", category: "work" },
  { emoji: "📈", name: "chart increasing grafik naik profit growth", category: "work" },
  { emoji: "🎯", name: "target fokus tujuan sasaran okr", category: "work" },
  { emoji: "🧠", name: "brain otak analisis riset berpikir", category: "work" },
  { emoji: "🏆", name: "trophy piala juara prestasi menang", category: "work" },
  { emoji: "📅", name: "calendar kalender jadwal meeting agenda", category: "work" },
  { emoji: "⏱️", name: "stopwatch waktu deadline durasi cepat", category: "work" },
  { emoji: "☕", name: "coffee kopi rehat istirahat kafein", category: "work" },
  { emoji: "📌", name: "pushpin pin penting catat tempel", category: "work" },

  // Symbols & Items
  { emoji: "✨", name: "sparkles kilau ai bintang baru bersih", category: "symbols" },
  { emoji: "🌟", name: "glowing star bintang terang hebat", category: "symbols" },
  { emoji: "⭐", name: "star bintang favorit nilai", category: "symbols" },
  { emoji: "💰", name: "money bag uang dana cuan investasi", category: "symbols" },
  { emoji: "🤖", name: "robot bot ai otomasi pintar", category: "symbols" },
  { emoji: "🔒", name: "lock gembok aman privat kunci", category: "symbols" },
  { emoji: "🔑", name: "key kunci akses password jalan", category: "symbols" },
  { emoji: "✉️", name: "envelope surat email pesan kirim", category: "symbols" },
  { emoji: "📦", name: "package paket rilis kirim barang", category: "symbols" },
  { emoji: "🔔", name: "bell lonceng notifikasi pengingat", category: "symbols" },
  { emoji: "🚨", name: "alert sirine bahaya darurat penting", category: "symbols" },
  { emoji: "🌈", name: "rainbow pelangi warna cerah damai", category: "symbols" },
];

export interface AnchorPosition {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface SlackEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  anchorRect?: AnchorPosition | null;
  align?: "left" | "right";
  position?: "top" | "bottom" | "auto";
}

export function SlackEmojiPicker({
  onSelectEmoji,
  onClose,
  anchorRect,
  align = "left",
  position = "auto",
}: SlackEmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute absolute portal position based on anchorRect and screen boundaries
  useEffect(() => {
    if (!anchorRect) return;

    const pickerWidth = Math.min(320, window.innerWidth - 24);
    const pickerHeight = 330;
    const margin = 8;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    // Horizontal calculation
    let calculatedLeft = align === "right"
      ? anchorRect.right - pickerWidth
      : anchorRect.left;

    // Constrain horizontally
    if (calculatedLeft + pickerWidth > winWidth - 12) {
      calculatedLeft = winWidth - pickerWidth - 12;
    }
    if (calculatedLeft < 12) {
      calculatedLeft = 12;
    }

    // Vertical calculation: check available space above and below
    let calculatedTop = 0;
    const spaceAbove = anchorRect.top;
    const spaceBelow = winHeight - anchorRect.bottom;

    if (position === "bottom") {
      calculatedTop = anchorRect.bottom + margin;
    } else if (position === "top") {
      if (spaceAbove < pickerHeight + 20 && spaceBelow > spaceAbove) {
        calculatedTop = anchorRect.bottom + margin;
      } else {
        calculatedTop = anchorRect.top - pickerHeight - margin;
      }
    } else {
      // Auto: prefer above if enough room, otherwise place below
      if (spaceAbove >= pickerHeight + margin + 40) {
        calculatedTop = anchorRect.top - pickerHeight - margin;
      } else {
        calculatedTop = anchorRect.bottom + margin;
      }
    }

    // Constrain vertically inside screen
    if (calculatedTop + pickerHeight > winHeight - 12) {
      calculatedTop = Math.max(12, winHeight - pickerHeight - 12);
    }
    if (calculatedTop < 12) {
      calculatedTop = 12;
    }

    setCoords({ top: calculatedTop, left: calculatedLeft });
  }, [anchorRect, align, position]);

  // Lock background scroll when modal is open, but allow scrolling inside picker
  useEffect(() => {
    const preventScroll = (e: WheelEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && pickerRef.current && pickerRef.current.contains(target)) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filteredEmojis = EMOJI_DATABASE.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.emoji.includes(q) || item.name.toLowerCase().includes(q);
  });

  const categories = [
    { id: "all", label: "Semua", icon: Sparkles },
    { id: "popular", label: "Populer", icon: Zap },
    { id: "smileys", label: "Ekspresi", icon: Smile },
    { id: "gestures", label: "Gestur", icon: ThumbsUp },
    { id: "work", label: "Kerja & Ide", icon: Briefcase },
    { id: "symbols", label: "Simbol", icon: Heart },
  ];

  const pickerContent = (
    <div
      ref={pickerRef}
      onClick={(e) => e.stopPropagation()}
      style={
        anchorRect
          ? {
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }
          : undefined
      }
      className={`z-[9999] w-72 sm:w-80 rounded-lg bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 ${
        !anchorRect
          ? position === "top"
            ? "absolute bottom-full mb-2 left-0"
            : "absolute top-full mt-2 left-0"
          : ""
      }`}
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari emoji (e.g. fire, jempol, rocket)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full pl-8 pr-6 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Pills Bar (No ugly scrollbar) */}
      <div className="flex items-center gap-1 p-1.5 border-b border-neutral-200/60 dark:border-neutral-800/80 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-[11px]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded-md shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#FFE500] text-neutral-950 font-bold shadow-2xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white font-medium"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Emoji Grid Matrix */}
      <div className="p-2 max-h-52 overflow-y-auto grid grid-cols-7 gap-1 select-none">
        {filteredEmojis.length === 0 ? (
          <div className="col-span-7 py-6 text-center text-xs text-neutral-400">
            Tidak menemukan emoji "{search}"
          </div>
        ) : (
          filteredEmojis.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectEmoji(item.emoji);
                onClose();
              }}
              title={item.name}
              className="w-9 h-9 rounded-md flex items-center justify-center text-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:scale-120 active:scale-95 transition-transform cursor-pointer"
            >
              {item.emoji}
            </button>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-200/60 dark:border-neutral-800/60 text-[10px] text-neutral-400 flex items-center justify-between">
        <span>Klik untuk tambah / hapus reaksi</span>
        <span className="font-mono">{filteredEmojis.length} emoji</span>
      </div>
    </div>
  );

  if (anchorRect && mounted && typeof document !== "undefined") {
    return createPortal(pickerContent, document.body);
  }

  return pickerContent;
}
