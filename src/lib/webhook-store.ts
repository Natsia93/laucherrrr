export interface WebhookEventRecord {
  id: string;
  webhookId: string;
  method: string;
  receivedAt: string;
  status: number;
  headers: Record<string, string | undefined>;
  body: any;
  ip?: string;
  matchedFlowName?: string;
}

const MAX_EVENTS = 50;

declare global {
  // eslint-disable-next-line no-var
  var __launcher_webhook_events__: WebhookEventRecord[] | undefined;
}

export function getWebhookEvents(): WebhookEventRecord[] {
  if (!globalThis.__launcher_webhook_events__) {
    globalThis.__launcher_webhook_events__ = [];
  }
  return globalThis.__launcher_webhook_events__;
}

export function recordWebhookEvent(event: Omit<WebhookEventRecord, "id">): WebhookEventRecord {
  const fullEvent: WebhookEventRecord = {
    ...event,
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  const list = getWebhookEvents();
  list.unshift(fullEvent);
  if (list.length > MAX_EVENTS) {
    list.pop();
  }
  return fullEvent;
}

export function clearWebhookEvents(): void {
  globalThis.__launcher_webhook_events__ = [];
}
