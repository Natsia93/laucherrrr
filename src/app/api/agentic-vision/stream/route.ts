import { NextRequest } from "next/server";
import { playwrightBrowser } from "@/lib/browser/playwrightService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const encoder = new TextEncoder();
    let unsubscribe: (() => void) | null = null;
    let keepAliveTimer: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      start(controller) {
        try {
          controller.enqueue(encoder.encode(": connected\n\n"));
        } catch {}

        try {
          const latest = playwrightBrowser?.getLatestFrame?.();
          if (latest) {
            controller.enqueue(encoder.encode(`data: ${latest}\n\n`));
          }
        } catch (e) {
          console.error("[Stream] getLatestFrame error:", e);
        }

        keepAliveTimer = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            if (keepAliveTimer) clearInterval(keepAliveTimer);
          }
        }, 10000);

        try {
          if (playwrightBrowser?.subscribeScreencast) {
            unsubscribe = playwrightBrowser.subscribeScreencast((base64) => {
              try {
                controller.enqueue(encoder.encode(`data: ${base64}\n\n`));
              } catch {}
            });
          }
        } catch (e) {
          console.error("[Stream] subscribe error:", e);
        }

        playwrightBrowser?.initScreencast?.().catch((err: any) => {
          console.warn("[Stream Route] initScreencast warning:", err);
        });
      },
      cancel() {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (outerErr: any) {
    console.error("[Stream GET outer error]:", outerErr);
    return new Response(`Error: ${outerErr?.message || outerErr}`, { status: 500 });
  }
}
