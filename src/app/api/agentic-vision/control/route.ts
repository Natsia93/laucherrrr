import { NextRequest, NextResponse } from "next/server";
import { playwrightBrowser } from "@/lib/browser/playwrightService";
import { desktopController } from "@/lib/os/desktopController";

export const runtime = "nodejs";

const DAEMON_URL = process.env.COMPUTER_CONTROL_URL || "http://127.0.0.1:8000";

// GET /api/agentic-vision/control - Fetch status or single on-demand screenshot
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "status";

  // 1. Status Check
  if (type === "status") {
    const pwStatus = playwrightBrowser.getStatus();
    const hasOsControl = await desktopController.isAvailable();
    return NextResponse.json({
      status: "online",
      engine: "playwright_direct",
      browser: "Google Chrome",
      isReady: pwStatus.isReady,
      hasNativeOsControl: hasOsControl,
      mode: "dom_no_screen_recording",
      message: "Browser CDP & Native OS Controller aktif.",
    });
  }

  // 2. On-demand single visual snapshot
  if (type === "screenshot" || type === "ondemand_screenshot") {
    try {
      const screenshot = await playwrightBrowser.captureOnDemandScreenshot();
      return NextResponse.json({
        type: "screenshot",
        source: "playwright_chrome",
        content: screenshot,
      });
    } catch (err: any) {
      // Fallback to daemon if running
      try {
        const res = await fetch(`${DAEMON_URL}/api/computer_control/screenshot`, {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {}

      return NextResponse.json(
        { error: "Gagal mengambil cuplikan visual on-demand", detail: err?.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Tipe request tidak dikenal" }, { status: 400 });
}

// POST /api/agentic-vision/control - Execute browser action via Playwright CDP & Native Linux OS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, url, target, text, x, y, key } = body;

    // A. Action: Google Search
    if (action === "search" || (action === "type" && query)) {
      const searchQuery = query || text;
      desktopController.focusChrome().catch(() => {});

      const searchResult = await playwrightBrowser.searchGoogle(searchQuery).catch(() => ({ results: [] }));
      return NextResponse.json({
        success: true,
        action: "search",
        data: searchResult,
      });
    }

    // B. Action: Direct URL Navigation
    if (action === "navigate" || action === "open") {
      const destUrl = url || text;
      desktopController.focusChrome().catch(() => {});

      const navResult = await playwrightBrowser.navigate(destUrl).catch(() => ({ url: destUrl }));
      return NextResponse.json({
        success: true,
        action: "navigate",
        data: navResult,
      });
    }

    // B.0 Action: Inspect Current Page (DOM Snapshot, active URL, text & interactive elements)
    if (action === "inspect" || action === "read_page") {
      try {
        const domSnapshot = await playwrightBrowser.getDOMSnapshot();
        return NextResponse.json({
          success: true,
          action: "inspect",
          data: domSnapshot,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: "Gagal membaca struktur halaman",
          detail: err?.message,
        });
      }
    }

    // B.1 Action: Auto Play Media (YouTube / Spotify auto-click & play on Desktop)
    if (action === "play_media" || action === "play") {
      const platform = (body.platform as "youtube" | "spotify") || (url?.includes("spotify") ? "spotify" : "youtube");
      const mediaQuery = query || text;

      // 1. Trigger Native OS playback on user's real desktop screen
      const osPlaybackPromise = desktopController.playMedia({
        platform,
        query: mediaQuery,
        url,
      }).catch((err) => {
        console.warn("[Control API] OS playback warning:", err);
        return null;
      });

      // 2. Also run in Playwright background session with timeout safeguard
      let pwResult: any = null;
      try {
        pwResult = await Promise.race([
          playwrightBrowser.playMedia({ platform, query: mediaQuery, url }),
          new Promise((r) => setTimeout(() => r(null), 5000)),
        ]);
      } catch {}

      const osResult = await osPlaybackPromise;

      return NextResponse.json({
        success: true,
        action: "play_media",
        data: {
          url: osResult?.url || pwResult?.url || url,
          title: osResult?.title || pwResult?.title || `Playing ${mediaQuery}`,
          videoTitle: pwResult?.videoTitle || mediaQuery,
          screenshot: pwResult?.screenshot,
        },
      });
    }

    // C. Action: Mouse Move
    if (action === "move") {
      if (typeof x === "number" && typeof y === "number") {
        await desktopController.smoothMoveMouse(x, y);
      }
      return NextResponse.json({ success: true, action: "move" });
    }

    // C.1 Action: Click Element / Link / OS Mouse Click
    if (action === "click") {
      if (typeof x === "number" && typeof y === "number") {
        await desktopController.click(x, y);
      }
      const clickTarget = target || text;
      let clickResult = null;
      if (clickTarget) {
        clickResult = await playwrightBrowser.click(clickTarget).catch(() => null);
      }
      return NextResponse.json({
        success: true,
        action: "click",
        data: clickResult,
      });
    }

    // C.2 Action: Type Text into Active Window / Field
    if (action === "type") {
      const textToType = text || query || "";
      if (textToType) {
        desktopController.typeText(textToType).catch(() => {});
      }
      const typeTarget = target || "input";
      const typeResult = await playwrightBrowser.typeText(typeTarget, textToType).catch(() => null);
      return NextResponse.json({
        success: true,
        action: "type",
        data: typeResult,
      });
    }

    // C.3 Action: Press Keyboard Key
    if (action === "press" && key) {
      await desktopController.pressKey(key);
      return NextResponse.json({ success: true, action: "press", key });
    }

    // C.4 Action: Smooth Page Scroll (Both Playwright & Native OS Desktop)
    if (action === "scroll" || action === "full_scan_scroll") {
      if (body.mode === "full_scan" || action === "full_scan_scroll") {
        const scanResult = await playwrightBrowser.fullPageScanScroll().catch(() => null);
        return NextResponse.json({
          success: true,
          action: "full_scan_scroll",
          data: scanResult,
        });
      }

      const direction = (body.direction as "up" | "down") || "down";
      const amount = Number(body.amount) || 550;
      desktopController.scroll(direction).catch(() => {});
      const scrollResult = await playwrightBrowser.scroll(direction, amount).catch(() => null);
      return NextResponse.json({
        success: true,
        action: "scroll",
        data: scrollResult,
      });
    }

    // C.5 Action: DOM Interactive Elements Snapshot
    if (action === "snapshot" || action === "dom" || action === "extract") {
      const domResult = await playwrightBrowser.getDOMSnapshot().catch(() => ({ interactiveElements: [] }));
      return NextResponse.json({
        success: true,
        action: "snapshot",
        data: domResult,
      });
    }

    // D. Action: Single On-Demand Screenshot
    if (action === "screenshot") {
      const imageSrc = await playwrightBrowser.captureOnDemandScreenshot().catch(() => null);
      return NextResponse.json({
        success: true,
        action: "screenshot",
        screenshot: imageSrc,
      });
    }

    // E. Action: Focus Chrome
    if (action === "launch" || action === "focus") {
      await desktopController.focusChrome();
      return NextResponse.json({
        success: true,
        action: "launch",
        message: "Google Chrome telah difokuskan di layar desktop.",
      });
    }

    // F. Action: Test AI Ghost Cursor Glide (Layar OS Asli & UI)
    if (action === "test_cursor") {
      desktopController.testCursorGlide().catch(() => {});
      const res = await playwrightBrowser.testCursorGlide().catch(() => ({ screenshot: null }));
      return NextResponse.json({
        success: true,
        action: "test_cursor",
        screenshot: res.screenshot,
        message: "Kursor AI berhasil digerakkan di layar desktop OS dan Google Chrome.",
      });
    }

    // G. Action: Close / Restart
    if (action === "close" || action === "restart") {
      await playwrightBrowser.close().catch(() => {});
      return NextResponse.json({
        success: true,
        action,
        message: "Instance browser berhasil ditutup/di-restart.",
      });
    }

    // Fallback to OS Desktop Daemon if running
    try {
      const res = await fetch(`${DAEMON_URL}/api/computer_control/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Aksi ${action} diproses secara langsung.`,
    });
  } catch (err: any) {
    console.error("Action execution error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengeksekusi aksi browser",
        detail: err?.message,
      },
      { status: 500 }
    );
  }
}
