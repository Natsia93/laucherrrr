import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { slackConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const GLOBAL_CONFIG_ID = "global-config";

interface DispatchField {
  label: string;
  value: string;
}

interface DispatchRequestBody {
  webhookUrl?: string;
  text: string;
  title?: string;
  category?: "custom" | "daily_agenda" | "ai_digest" | "deck_share" | "task_update" | "ping";
  channel?: string;
  mention?: "none" | "here" | "channel";
  fields?: DispatchField[];
  botName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: DispatchRequestBody = await req.json();
    let {
      webhookUrl,
      text,
      title,
      category = "custom",
      channel,
      mention = "none",
      fields = [],
      botName,
    } = body;

    // 1. Resolve Webhook URL: Priority -> Body > Database > Environment Variable
    if (!webhookUrl || !webhookUrl.trim()) {
      try {
        const [config] = await db
          .select()
          .from(slackConfigs)
          .where(eq(slackConfigs.id, GLOBAL_CONFIG_ID));
        if (config?.webhookUrl?.trim()) {
          webhookUrl = config.webhookUrl.trim();
          if (!botName && config.botName) botName = config.botName;
          if (!channel && config.defaultChannel) channel = config.defaultChannel;
        }
      } catch (dbErr) {
        console.warn("[Slack Dispatch] Could not fetch saved DB config:", dbErr);
      }
    }

    if (!webhookUrl || !webhookUrl.trim()) {
      webhookUrl = process.env.SLACK_WEBHOOK_URL || "";
    }

    if (!webhookUrl || !webhookUrl.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Slack Webhook URL is not configured. Please set your Webhook URL in Settings.",
        },
        { status: 400 }
      );
    }

    // Validate webhook format
    if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Webhook URL format. Must start with 'https://hooks.slack.com/'",
        },
        { status: 400 }
      );
    }

    // 2. Prepare mention prefix
    let mentionPrefix = "";
    if (mention === "here") mentionPrefix = "<!here> ";
    if (mention === "channel") mentionPrefix = "<!channel> ";

    const fullText = `${mentionPrefix}${text}`.trim();

    // 3. Construct Slack Block Kit Payload (Clean, executive typography without emojis)
    const blocks: any[] = [];

    // Header block
    if (title && title.trim()) {
      blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: title.trim().substring(0, 150),
        },
      });
    }

    // Main text section
    if (fullText) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: fullText,
        },
      });
    }

    // Optional structured fields (2 columns in Slack)
    if (fields && fields.length > 0) {
      const slackFields = fields.slice(0, 10).map((f) => ({
        type: "mrkdwn",
        text: `*${f.label}:*\n${f.value}`,
      }));
      blocks.push({
        type: "section",
        fields: slackFields,
      });
    }

    // Divider
    blocks.push({ type: "divider" });

    // Context footer
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Dispatched via Launcher OS • <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toLocaleTimeString()}>`,
        },
      ],
    });

    const slackPayload: any = {
      text: title ? `*${title}*: ${fullText}` : fullText,
      blocks,
    };

    if (botName) slackPayload.username = botName;
    if (channel) slackPayload.channel = channel.startsWith("#") ? channel : `#${channel}`;

    // 5. Send POST to Slack
    const slackRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload),
    });

    const responseText = await slackRes.text();

    if (!slackRes.ok || responseText !== "ok") {
      console.error("[Slack Dispatch Error]", slackRes.status, responseText);
      return NextResponse.json(
        {
          success: false,
          error: `Slack rejected the request (${slackRes.status}): ${responseText || "Webhook error occurred"}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deliveredAt: new Date().toISOString(),
      channel: channel || "default",
      message: "Message dispatched successfully to Slack!",
    });
  } catch (err: any) {
    console.error("[Slack Dispatch Exception]", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error while dispatching to Slack.",
      },
      { status: 500 }
    );
  }
}
