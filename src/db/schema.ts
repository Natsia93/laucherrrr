import { pgTable, text, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- BETTER AUTH TABLES ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// --- APP TABLES ---

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id), // Kepemilikan dokumen
  title: text("title").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  status: text("status").default("Pending"),
  size: text("size").default("0 KB"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  chatHistory: jsonb("chat_history").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const todos = pgTable("todos", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  task: text("task").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scratchpads = pgTable("scratchpads", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  category: text("category").default("strategy").notNull(), // strategy, meeting, review, task
  color: text("color").default("#FFE500"),
  location: text("location"),
  meetLink: text("meet_link"),
  googleEventId: text("google_event_id"),
  isAllDay: boolean("is_all_day").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflows = pgTable("workflows", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").default(""),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
  viewport: jsonb("viewport"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowRuns = pgTable("workflow_runs", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").references(() => workflows.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("success"), // success, error, running
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  logs: jsonb("logs").default([]),
  durationMs: text("duration_ms").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- SLACK WORKSPACE TABLES ---

export const slackChannels = pgTable("slack_channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  topic: text("topic"),
  description: text("description"),
  type: text("type").default("channel").notNull(), // channel, dm, email
  isPrivate: boolean("is_private").default(false),
  isEmailBridge: boolean("is_email_bridge").default(false),
  emailAddress: text("email_address"),
  unreadCount: text("unread_count").default("0"),
  membersCount: text("members_count").default("8"),
  avatar: text("avatar"),
  partnerUser: jsonb("partner_user"),
  pinnedMessageIds: jsonb("pinned_message_ids").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const slackMessages = pgTable("slack_messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id")
    .notNull()
    .references(() => slackChannels.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  user: jsonb("user").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").default([]),
  reactions: jsonb("reactions").default([]),
  threadCount: text("thread_count").default("0"),
  threadLastReply: text("thread_last_reply"),
  threads: jsonb("threads").default([]),
  isPinned: boolean("is_pinned").default(false),
  emailMeta: jsonb("email_meta"),
  isAi: boolean("is_ai").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const slackConfigs = pgTable("slack_configs", {
  id: text("id").primaryKey(), // "global"
  webhookUrl: text("webhook_url").default(""),
  defaultChannel: text("default_channel").default("#general"),
  botName: text("bot_name").default("Launcher OS Bot"),
  emailBridgeEnabled: boolean("email_bridge_enabled").default(true),
  inboundEmailDomain: text("inbound_email_domain").default("launcheros.app"),
  autoAiReply: boolean("auto_ai_reply").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- RELATIONS ---

export const slackChannelRelations = relations(slackChannels, ({ many }) => ({
  messages: many(slackMessages),
}));

export const slackMessageRelations = relations(slackMessages, ({ one }) => ({
  channel: one(slackChannels, {
    fields: [slackMessages.channelId],
    references: [slackChannels.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  documents: many(documents),
  todos: many(todos),
  scratchpads: many(scratchpads),
  calendarEvents: many(calendarEvents),
  workflows: many(workflows),
  workflowRuns: many(workflowRuns),
}));

export const workflowRelations = relations(workflows, ({ one, many }) => ({
  user: one(user, {
    fields: [workflows.userId],
    references: [user.id],
  }),
  runs: many(workflowRuns),
}));

export const workflowRunRelations = relations(workflowRuns, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowRuns.workflowId],
    references: [workflows.id],
  }),
  user: one(user, {
    fields: [workflowRuns.userId],
    references: [user.id],
  }),
}));

export const documentRelations = relations(documents, ({ one }) => ({
  user: one(user, {
    fields: [documents.userId],
    references: [user.id],
  }),
}));

export const todoRelations = relations(todos, ({ one }) => ({
  user: one(user, {
    fields: [todos.userId],
    references: [user.id],
  }),
}));

export const scratchpadRelations = relations(scratchpads, ({ one }) => ({
  user: one(user, {
    fields: [scratchpads.userId],
    references: [user.id],
  }),
}));

export const calendarEventRelations = relations(calendarEvents, ({ one }) => ({
  user: one(user, {
    fields: [calendarEvents.userId],
    references: [user.id],
  }),
}));



