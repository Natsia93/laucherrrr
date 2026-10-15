import { SlackChannel, SlackMessage, SlackUser } from "./types";

export const MOCK_USERS: Record<string, SlackUser> = {
  current: {
    id: "user-current",
    name: "Fiqiy Muhammad",
    email: "fiqiy@revou.co",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Workspace Owner",
    status: "online",
  },
};

export const INITIAL_CHANNELS: SlackChannel[] = [
  {
    id: "c-general",
    name: "general",
    topic: "Ruang kolaborasi dan koordinasi tim Launcher OS 🚀",
    description: "General channel untuk seluruh anggota tim Launcher OS",
    isPrivate: false,
    isEmailBridge: false,
    type: "channel",
    unreadCount: 0,
    membersCount: 1,
  },
  {
    id: "c-email-support",
    name: "inbox-support",
    topic: "📥 Terhubung dengan support@launcheros.app • Email Bridge aktif",
    description: "Email Bridge dua arah untuk pesan dan bantuan klien",
    isPrivate: false,
    isEmailBridge: true,
    emailAddress: "support@launcheros.app",
    type: "email",
    unreadCount: 0,
    membersCount: 1,
  },
];

export const INITIAL_MESSAGES: SlackMessage[] = [];
