import { NextRequest } from "next/server";
import { playwrightBrowser } from "@/lib/browser/playwrightService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let unsubscribe: (() => void) | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      const sendFrame = (buf: Buffer) => {
        if (isClosed) return;
        try {
          const header = Buffer.from(
            `--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${buf.length}\r\n\r\n`
          );
          const footer = Buffer.from("\r\n");
          controller.enqueue(Buffer.concat([header, buf, footer]));
        } catch {
          // Stream closed by client
        }
      };

      // 1. Immediately flush boundary and send initial frame
      try {
        controller.enqueue(Buffer.from("--frame\r\n"));
        playwrightBrowser.getOrCaptureFrameBuffer().then((buf) => {
          if (buf) sendFrame(buf);
        }).catch(() => {});
      } catch {}

      // 2. Subscribe to incoming CDP screencast frames from Google Chrome
      try {
        unsubscribe = playwrightBrowser.subscribeBuffer((buf) => {
          sendFrame(buf);
        });
      } catch {}

      // 3. Heartbeat: re-send or capture frame every 1.5s so live video stream never freezes
      heartbeatTimer = setInterval(async () => {
        if (isClosed) return;
        try {
          const buf = await playwrightBrowser.getOrCaptureFrameBuffer();
          if (buf) {
            sendFrame(buf);
          }
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 1500);

      // 4. Ensure CDP screencast is actively streaming
      playwrightBrowser.initScreencast().catch((err) => {
        console.warn("[Feed Route] initScreencast warning:", err);
      });
    },
    cancel() {
      isClosed = true;
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "multipart/x-mixed-replace; boundary=frame",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
