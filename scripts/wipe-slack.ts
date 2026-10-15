import { config } from "dotenv";
config({ path: ".env.local" });
config();

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { slackMessages, slackChannels } from "../src/db/schema";
import { INITIAL_CHANNELS } from "../src/components/slack/mockData";

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error("No DATABASE_URL found in environment");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false, ssl: "require" });
const db = drizzle(client);

async function main() {
  console.log("Connecting to database and wiping dummy Slack data...");
  try {
    await db.delete(slackMessages);
    console.log("✓ Cleared all messages from slack_messages");

    await db.delete(slackChannels);
    console.log("✓ Cleared all channels from slack_channels");

    const cleanChannels = INITIAL_CHANNELS.map((ch) => ({
      id: ch.id,
      name: ch.name,
      topic: ch.topic || "",
      description: ch.description || "",
      type: ch.type || "channel",
      isPrivate: Boolean(ch.isPrivate),
      isEmailBridge: Boolean(ch.isEmailBridge),
      emailAddress: ch.emailAddress || null,
      unreadCount: "0",
      membersCount: "1",
      partnerUser: null,
      pinnedMessageIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(slackChannels).values(cleanChannels);
    console.log("✓ Seeded clean default channels (#general, inbox-support)");
    console.log("All dummy data successfully removed!");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("Wipe error:", err);
    await client.end();
    process.exit(1);
  }
}

main();
