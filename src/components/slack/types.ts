export interface SlackUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status: "online" | "away" | "offline";
  isBot?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "doc" | "sheet" | "zip" | "presentation" | "other";
  url: string;
  size: string;
  previewUrl?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs or names
}

export interface EmailMetadata {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  deliveredViaEmail: boolean;
  messageId?: string;
  inReplyTo?: string;
}

export interface SlackMessage {
  id: string;
  channelId: string;
  userId: string;
  user: SlackUser;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  threadCount?: number;
  threadLastReply?: string;
  threads?: SlackMessage[];
  isPinned?: boolean;
  emailMeta?: EmailMetadata;
  isAI?: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  topic?: string;
  description?: string;
  isPrivate?: boolean;
  isEmailBridge?: boolean;
  emailAddress?: string;
  type: "channel" | "dm" | "email";
  unreadCount?: number;
  membersCount?: number;
  avatar?: string;
  partnerUser?: SlackUser;
  pinnedMessageIds?: string[];
}

export interface SlackWorkspaceConfig {
  webhookUrl: string;
  defaultChannel: string;
  botName: string;
  emailBridgeEnabled: boolean;
  inboundEmailDomain: string;
  autoAiReply: boolean;
}
