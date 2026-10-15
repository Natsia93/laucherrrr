import { chromium, type Browser, type BrowserContext, type Page } from "playwright-core";
import path from "path";
import os from "os";
import { desktopController } from "@/lib/os/desktopController";

/**
 * Singleton Playwright Browser Controller for Launcher OS
 * Inspired by Saveera's OpenClaw browser architecture.
 * Directly controls Google Chrome via Chrome DevTools Protocol (CDP) / Playwright
 * WITHOUT continuous screen recording, saving thousands of multimodal tokens.
 * Features signature on-screen AI Ghost Cursor and Ghost Typing inside real Google Chrome.
 */
class PlaywrightBrowserService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isInitializing: boolean = false;
  private lastActivity: number = Date.now();
  private chromeExecutable: string = "/usr/bin/google-chrome";
  private cdpSession: any = null;
  private screencastListeners: Set<(base64: string) => void> = new Set();
  private bufferListeners: Set<(buf: Buffer) => void> = new Set();
  private latestFrame: string | null = null;
  private latestBuffer: Buffer | null = null;
  private isScreencasting: boolean = false;

  constructor() {
    if (!this.bufferListeners) {
      this.bufferListeners = new Set();
    }
    if (!this.screencastListeners) {
      this.screencastListeners = new Set();
    }
    if (process.env.CHROME_BIN) {
      this.chromeExecutable = process.env.CHROME_BIN;
    }
  }

  /**
   * Initialize Chrome DevTools Protocol Screencast streaming
   */
  public async initScreencast(): Promise<void> {
    const page = await this.getPage();
    if (this.isScreencasting && this.cdpSession) {
      return;
    }

    try {
      this.cdpSession = await page.context().newCDPSession(page);
      this.cdpSession.on("Page.screencastFrame", async (event: any) => {
        try {
          await this.cdpSession?.send("Page.screencastFrameAck", { sessionId: event.sessionId });
        } catch {}
        
        this.latestFrame = event.data;
        const buf = Buffer.from(event.data, "base64");
        this.latestBuffer = buf;

        if (this.bufferListeners) {
          for (const cb of this.bufferListeners) {
            try {
              cb(buf);
            } catch {}
          }
        }

        if (this.screencastListeners) {
          for (const cb of this.screencastListeners) {
            try {
              cb(event.data);
            } catch {}
          }
        }
      });

      await this.cdpSession.send("Page.startScreencast", {
        format: "jpeg",
        quality: 80,
        maxWidth: 1280,
        maxHeight: 800,
        everyNthFrame: 1,
      });
      this.isScreencasting = true;

      // Ensure immediate initial frame
      if (!this.latestBuffer) {
        page.screenshot({ type: "jpeg", quality: 80 }).then((buf) => {
          if (!this.latestBuffer) {
            this.latestBuffer = buf;
            this.latestFrame = buf.toString("base64");
            if (this.bufferListeners) {
              for (const cb of this.bufferListeners) {
                try { cb(buf); } catch {}
              }
            }
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("CDP Screencast init warning:", err);
    }
  }

  /**
   * Subscribe a callback to receive real-time screencast frames (Buffer)
   */
  public subscribeBuffer(callback: (buf: Buffer) => void): () => void {
    if (!this.bufferListeners) this.bufferListeners = new Set();
    this.bufferListeners.add(callback);
    if (this.latestBuffer) {
      try {
        callback(this.latestBuffer);
      } catch {}
    }
    this.initScreencast().catch(() => {});
    return () => {
      this.bufferListeners?.delete(callback);
    };
  }

  /**
   * Get the most recent screencast buffer (Buffer), or capture one on-demand if null
   */
  public async getOrCaptureFrameBuffer(): Promise<Buffer | null> {
    if (this.latestBuffer) return this.latestBuffer;
    if (this.page && !this.page.isClosed()) {
      try {
        const buf = await this.page.screenshot({ type: "jpeg", quality: 80 });
        this.latestBuffer = buf;
        this.latestFrame = buf.toString("base64");
        return buf;
      } catch {}
    }
    return null;
  }

  public getLatestFrameBuffer(): Buffer | null {
    return this.latestBuffer;
  }

  /**
   * Subscribe a callback to receive real-time screencast frames (base64 JPEG)
   */
  public subscribeScreencast(callback: (base64: string) => void): () => void {
    if (!this.screencastListeners) this.screencastListeners = new Set();
    this.screencastListeners.add(callback);
    if (this.latestFrame) {
      try {
        callback(this.latestFrame);
      } catch {}
    }
    this.initScreencast().catch(() => {});
    return () => {
      this.screencastListeners?.delete(callback);
    };
  }

  /**
   * Get the most recent screencast frame (base64 JPEG)
   */
  public getLatestFrame(): string | null {
    return this.latestFrame;
  }

  /**
   * Injects signature on-screen AI Ghost Cursor directly into real Google Chrome
   */
  private async ensureGhostCursorInPage(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        // @ts-ignore
        if (typeof window.__showLauncherGhostCursor === "function") return;

        function initGhost() {
          if (document.getElementById("__launcher_ai_ghost_cursor__")) return;
          if (!document.body) return;

          const cursor = document.createElement("div");
          cursor.id = "__launcher_ai_ghost_cursor__";
          cursor.style.cssText = `
            position: fixed !important;
            left: 450px;
            top: 250px;
            width: 38px;
            height: 38px;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            transition: left 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) !important;
            display: block !important;
          `;
          cursor.innerHTML = `
            <div style="position: relative; pointer-events: none;">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <path d="M5.8 3.5C5.35 3.5 5 3.9 5 4.45V19.8C5 20.45 5.75 20.85 6.3 20.45L10.6 16.5C10.9 16.25 11.3 16.1 11.7 16.1H17.8C18.45 16.1 18.85 15.35 18.45 14.8L6.7 3.75C6.45 3.55 6.15 3.5 5.8 3.5Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
              </svg>
              <div id="__launcher_ghost_ripple__" style="position: absolute; top: -10px; left: -10px; width: 58px; height: 58px; border-radius: 50%; border: 2.5px solid rgba(255, 255, 255, 0.85); opacity: 0; pointer-events: none; transition: transform 0.32s ease-out, opacity 0.32s ease-out; transform: scale(0.35);"></div>
            </div>
          `;
          document.body.appendChild(cursor);
        }

        // @ts-ignore
        window.__showLauncherGhostCursor = (x: any, y: any) => {
          initGhost();
          const el = document.getElementById("__launcher_ai_ghost_cursor__");
          if (el) {
            el.style.display = "block";
            if (typeof x === "number") el.style.left = `${x}px`;
            if (typeof y === "number") el.style.top = `${y}px`;
          }
        };

        // @ts-ignore
        window.__triggerLauncherRipple = () => {
          initGhost();
          const rip = document.getElementById("__launcher_ghost_ripple__");
          if (rip) {
            rip.style.opacity = "1";
            rip.style.transform = "scale(1.35)";
            setTimeout(() => {
              rip.style.opacity = "0";
              rip.style.transform = "scale(0.35)";
            }, 320);
          }
        };

        initGhost();
      });
    } catch {}
  }

  /**
   * Ensure browser instance is active and ready
   */
  public async getPage(): Promise<Page> {
    this.lastActivity = Date.now();

    if (this.page && !this.page.isClosed()) {
      return this.page;
    }

    if (this.isInitializing) {
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 250));
        if (this.page && !this.page.isClosed()) return this.page;
      }
    }

    this.isInitializing = true;
    try {
      const defaultUserDir = path.join(os.homedir(), ".config", "google-chrome-launcher-agent");
      
      const launchOpts = {
        executablePath: this.chromeExecutable,
        headless: false,
        env: { ...process.env, DISPLAY: process.env.DISPLAY || ":0" },
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        args: [
          "--start-maximized",
          "--disable-blink-features=AutomationControlled",
          "--disable-infobars",
          "--no-default-browser-check",
          "--no-first-run",
          "--lang=id-ID,id,en-US,en",
        ],
        viewport: null,
      };

      try {
        this.context = await chromium.launchPersistentContext(defaultUserDir, launchOpts);
      } catch (err: any) {
        if (err?.message?.includes("already in use") || err?.message?.includes("existing browser session")) {
          const fallbackDir = path.join(os.tmpdir(), `launcher_chrome_${Date.now()}`);
          this.context = await chromium.launchPersistentContext(fallbackDir, launchOpts);
        } else {
          throw err;
        }
      }

      const pages = this.context.pages();
      this.page = pages.length > 0 ? pages[0] : await this.context.newPage();

      await this.page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });

        function initGhost() {
          if (document.getElementById("__launcher_ai_ghost_cursor__")) return;
          if (!document.body) return;

          const cursor = document.createElement("div");
          cursor.id = "__launcher_ai_ghost_cursor__";
          cursor.style.cssText = `
            position: fixed !important;
            left: 450px;
            top: 250px;
            width: 38px;
            height: 38px;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            transition: left 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) !important;
            display: block !important;
          `;
          cursor.innerHTML = `
            <div style="position: relative; pointer-events: none;">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <path d="M5.8 3.5C5.35 3.5 5 3.9 5 4.45V19.8C5 20.45 5.75 20.85 6.3 20.45L10.6 16.5C10.9 16.25 11.3 16.1 11.7 16.1H17.8C18.45 16.1 18.85 15.35 18.45 14.8L6.7 3.75C6.45 3.55 6.15 3.5 5.8 3.5Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
              </svg>
              <div id="__launcher_ghost_ripple__" style="position: absolute; top: -10px; left: -10px; width: 58px; height: 58px; border-radius: 50%; border: 2.5px solid rgba(255, 255, 255, 0.85); opacity: 0; pointer-events: none; transition: transform 0.32s ease-out, opacity 0.32s ease-out; transform: scale(0.35);"></div>
            </div>
          `;
          document.body.appendChild(cursor);
        }

        // @ts-ignore
        window.__showLauncherGhostCursor = (x, y) => {
          initGhost();
          const el = document.getElementById("__launcher_ai_ghost_cursor__");
          if (el) {
            el.style.display = "block";
            if (typeof x === "number") el.style.left = `${x}px`;
            if (typeof y === "number") el.style.top = `${y}px`;
          }
        };

        // @ts-ignore
        window.__triggerLauncherRipple = () => {
          initGhost();
          const rip = document.getElementById("__launcher_ghost_ripple__");
          if (rip) {
            rip.style.opacity = "1";
            rip.style.transform = "scale(1.35)";
            setTimeout(() => {
              rip.style.opacity = "0";
              rip.style.transform = "scale(0.35)";
            }, 320);
          }
        };

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initGhost);
        } else {
          initGhost();
        }
      });
      
      // Default initial navigation to official Google
      await this.page.goto("https://www.google.com", { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      await this.ensureGhostCursorInPage(this.page);

      return this.page;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Test signature Ghost Cursor gliding across real Chrome
   */
  public async testCursorGlide(): Promise<{ success: boolean; screenshot?: string }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});
    await this.ensureGhostCursorInPage(page);

    // 1. Starting position
    await page.evaluate(() => {
      // @ts-ignore
      window.__showLauncherGhostCursor?.(120, 140);
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 500));

    // 2. Glide smoothly to center
    await page.evaluate(() => {
      // @ts-ignore
      window.__showLauncherGhostCursor?.(580, 280);
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 700));

    // 3. Trigger Click Ripple
    await page.evaluate(() => {
      // @ts-ignore
      window.__triggerLauncherRipple?.();
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 350));

    // 4. Glide to button area
    await page.evaluate(() => {
      // @ts-ignore
      window.__showLauncherGhostCursor?.(420, 420);
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));

    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);
    return { success: true, screenshot };
  }

  /**
   * Navigate to any URL directly with visual cursor animation
   */
  public async navigate(url: string): Promise<{
    url: string;
    title: string;
    contentSummary: string;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});
    await this.ensureGhostCursorInPage(page);

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    // Animate cursor to top
    await page.evaluate(() => {
      // @ts-ignore
      window.__showLauncherGhostCursor?.(350, 40);
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 450));

    let spotifySongQuery = "";
    if (target.includes("spotify.com/search/")) {
      const parts = target.split("spotify.com/search/");
      if (parts[1]) {
        spotifySongQuery = decodeURIComponent(parts[1].split("?")[0].replace(/\+/g, " "));
      }
    }

    if (spotifySongQuery) {
      // 1. Open Spotify search page
      await page.goto("https://open.spotify.com/search", { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
      await this.ensureGhostCursorInPage(page);

      // 2. Locate search input field in Spotify
      try {
        const searchInput = page.locator('input[data-testid="search-input"], input[type="search"], input[role="searchbox"], input').first();
        if (await searchInput.waitFor({ state: "visible", timeout: 6000 }).then(() => true).catch(() => false)) {
          const sBox = await searchInput.boundingBox();
          if (sBox) {
            // Glide sleek black cursor to Spotify search input
            const targetX = Math.round(sBox.x + Math.min(sBox.width / 2, 140));
            const targetY = Math.round(sBox.y + sBox.height / 2);
            await page.evaluate(({ x, y }) => {
              // @ts-ignore
              window.__showLauncherGhostCursor?.(x, y);
            }, { x: targetX, y: targetY }).catch(() => {});
            await new Promise((r) => setTimeout(r, 600));

            // Click ripple
            await page.evaluate(() => {
              // @ts-ignore
              window.__triggerLauncherRipple?.();
            }).catch(() => {});
            await new Promise((r) => setTimeout(r, 200));

            await searchInput.click();
            await searchInput.fill("");

            // GHOST TYPING THE SONG TITLE INTO SPOTIFY SEARCH!
            for (const char of spotifySongQuery) {
              await searchInput.press(char);
              await new Promise((r) => setTimeout(r, 70));
            }

            await new Promise((r) => setTimeout(r, 400));
            await page.keyboard.press("Enter");
            await new Promise((r) => setTimeout(r, 1200));
          }
        } else {
          await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
        }
      } catch {
        await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
      }
    } else {
      await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
    }

    await this.ensureGhostCursorInPage(page);

    // Position ghost cursor neatly in page without jitter scrolling
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      // @ts-ignore
      window.__showLauncherGhostCursor?.(400, 300);
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 300));

    const freshBuf = await page.screenshot({ type: "jpeg", quality: 80 }).catch(() => null);
    if (freshBuf) {
      this.latestBuffer = freshBuf;
      this.latestFrame = freshBuf.toString("base64");
      if (this.bufferListeners) {
        for (const cb of this.bufferListeners) {
          try { cb(freshBuf); } catch {}
        }
      }
    }

    const title = await page.title();
    const currentUrl = page.url();
    const contentSummary = await this.extractTextSummary(page);
    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

    return {
      url: currentUrl,
      title,
      contentSummary,
      screenshot,
    };
  }

  /**
   * Execute Google Search using direct browser DOM interaction with visible Ghost Cursor & Ghost Typing
   */
  public async searchGoogle(query: string): Promise<{
    query: string;
    url: string;
    title: string;
    results: Array<{ title: string; url: string; snippet: string }>;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});

    // Ensure we are on Google homepage
    if (!page.url().includes("google.com")) {
      await page.goto("https://www.google.com", { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
    }

    await this.ensureGhostCursorInPage(page);

    try {
      // Locate real Google search box
      const searchBox = page.locator('textarea[name="q"], input[name="q"]').first();
      await searchBox.waitFor({ state: "visible", timeout: 5000 });
      const box = await searchBox.boundingBox();

      if (box) {
        const targetX = Math.round(box.x + Math.min(box.width / 2, 280));
        const targetY = Math.round(box.y + box.height / 2);

        // 1. Glide cursor to search box smoothly!
        await page.evaluate(({ x, y }) => {
          // @ts-ignore
          window.__showLauncherGhostCursor?.(x, y);
        }, { x: targetX, y: targetY }).catch(() => {});
        await new Promise((r) => setTimeout(r, 650));

        // 2. Click ripple
        await page.evaluate(() => {
          // @ts-ignore
          window.__triggerLauncherRipple?.();
        }).catch(() => {});
        await new Promise((r) => setTimeout(r, 200));

        await searchBox.click();
        await searchBox.fill("");

        // 3. Real Ghost Typing
        for (const char of query) {
          await searchBox.press(char);
          await new Promise((r) => setTimeout(r, 60));
        }

        await new Promise((r) => setTimeout(r, 350));

        // 4. Glide to "Penelusuran Google" button if visible
        const searchBtn = page.locator('input[name="btnK"], input[value="Penelusuran Google"]').first();
        const btnBox = await searchBtn.boundingBox().catch(() => null);
        if (btnBox) {
          const btnX = Math.round(btnBox.x + btnBox.width / 2);
          const btnY = Math.round(btnBox.y + btnBox.height / 2);
          await page.evaluate(({ x, y }) => {
            // @ts-ignore
            window.__showLauncherGhostCursor?.(x, y);
          }, { x: btnX, y: btnY }).catch(() => {});
          await new Promise((r) => setTimeout(r, 500));
          await page.evaluate(() => {
            // @ts-ignore
            window.__triggerLauncherRipple?.();
          }).catch(() => {});
        }

        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {}),
          page.keyboard.press("Enter"),
        ]);
        await new Promise((r) => setTimeout(r, 900));
      }
    } catch {
      // Fallback: direct navigation if input locator timed out
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
    }

    if (page.url().includes("sorry/index") || page.url().includes("google.com/sorry")) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
    }

    await this.ensureGhostCursorInPage(page);

    // 5. In results page: Glide down to first result link!
    try {
      const firstHeading = page.locator("h3").first();
      if (await firstHeading.isVisible({ timeout: 3500 }).catch(() => false)) {
        const hBox = await firstHeading.boundingBox();
        if (hBox) {
          await page.evaluate(({ x, y }) => {
            // @ts-ignore
            window.__showLauncherGhostCursor?.(x, y);
          }, { x: Math.round(hBox.x + 30), y: Math.round(hBox.y + hBox.height / 2) }).catch(() => {});
          await new Promise((r) => setTimeout(r, 600));
          await page.evaluate(() => {
            // @ts-ignore
            window.__triggerLauncherRipple?.();
          }).catch(() => {});
        }
      }
    } catch {}

    // 5b. Visible smooth scrolling across search results
    await page.evaluate(() => {
      // @ts-ignore
      window.__showLauncherGhostCursor?.(600, 380);
      window.scrollBy({ top: 400, behavior: "smooth" });
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 700));

    await page.evaluate(() => {
      // @ts-ignore
      window.__showLauncherGhostCursor?.(600, 180);
      window.scrollBy({ top: -250, behavior: "smooth" });
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));

    const title = await page.title();
    const currentUrl = page.url();

    // Extract search results from DOM with resilient retry
    let results: Array<{ title: string; url: string; snippet: string }> = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        results = await page.evaluate(() => {
          const items: Array<{ title: string; url: string; snippet: string }> = [];
          const headers = document.querySelectorAll("h3");
          
          headers.forEach((h3) => {
            const titleText = h3.innerText?.trim();
            const anchor = h3.closest("a");
            if (titleText && anchor && anchor.href && !anchor.href.includes("google.com/search")) {
              let snippet = "";
              const container = h3.closest("div[data-hveid]") || h3.parentElement?.parentElement;
              if (container) {
                const spans = container.querySelectorAll("div, span");
                for (let i = 0; i < spans.length; i++) {
                  const text = (spans[i] as HTMLElement).innerText?.trim();
                  if (text && text.length > 30 && text !== titleText) {
                    snippet = text.slice(0, 200);
                    break;
                  }
                }
              }
              items.push({
                title: titleText,
                url: anchor.href,
                snippet: snippet || "Informasi relevan dari hasil pencarian Google.",
              });
            }
          });
          return items.slice(0, 5);
        });
        if (results.length > 0) break;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

    return {
      query,
      url: currentUrl,
      title,
      results,
      screenshot,
    };
  }

  /**
  /**
   * Click an element with exact coordinate precision on both real OS desktop and Chrome DOM
   */
  public async click(target: string): Promise<{
    success: boolean;
    url: string;
    title: string;
    contentSummary: string;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});
    await this.ensureGhostCursorInPage(page);

    // If target is a URL, navigate directly!
    if (/^https?:\/\//i.test(target.trim())) {
      const navRes = await this.navigate(target.trim());
      return {
        success: true,
        ...navRes,
      };
    }

    let clicked = false;
    const cleanTarget = target.trim();

    // Strategy 1: Check if target is an index number (e.g. "[3]" or "3")
    const indexMatch = cleanTarget.match(/^\[?(\d+)\]?$/);
    if (indexMatch) {
      const targetIdx = parseInt(indexMatch[1], 10);
      try {
        const domSnap = await this.getDOMSnapshot();
        const found = domSnap.interactiveElements.find((e: any) => e.index === targetIdx);
        if (found?.box) {
          const cx = found.box.x + Math.round(found.box.width / 2);
          const cy = found.box.y + Math.round(found.box.height / 2);

          await desktopController.moveAndClickAtViewport(cx, cy, true);
          await page.evaluate(({ x, y }) => {
            // @ts-ignore
            window.__showLauncherGhostCursor?.(x, y);
            // @ts-ignore
            window.__triggerLauncherRipple?.();
          }, { x: cx, y: cy }).catch(() => {});
          await page.mouse.click(cx, cy);
          clicked = true;
        }
      } catch {}
    }

    // Strategy 2: Locator cascade (Buttons, Links, Headers, Inputs, Roles)
    if (!clicked) {
      const candidateLocators = [
        page.getByRole("button", { name: cleanTarget, exact: false }).first(),
        page.getByRole("link", { name: cleanTarget, exact: false }).first(),
        page.locator(`button:has-text("${cleanTarget}"), [role="button"]:has-text("${cleanTarget}")`).first(),
        page.locator(`a:has-text("${cleanTarget}"), [role="link"]:has-text("${cleanTarget}")`).first(),
        page.locator(`[aria-label*="${cleanTarget}" i], [title*="${cleanTarget}" i]`).first(),
        page.locator(`#search h3:has-text("${cleanTarget}"), h3:has-text("${cleanTarget}")`).first(),
        page.locator(`text="${cleanTarget}"`).first(),
      ];

      for (const loc of candidateLocators) {
        try {
          if (await loc.isVisible({ timeout: 1200 })) {
            await loc.scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
            const box = await loc.boundingBox();
            if (box) {
              const cx = Math.round(box.x + box.width / 2);
              const cy = Math.round(box.y + box.height / 2);

              // 1. Move real physical desktop OS mouse to exact coordinates and click
              await desktopController.moveAndClickAtViewport(cx, cy, true);

              // 2. Visual Ghost Cursor inside Chrome page
              await page.evaluate(({ x, y }) => {
                // @ts-ignore
                window.__showLauncherGhostCursor?.(x, y);
                // @ts-ignore
                window.__triggerLauncherRipple?.();
              }, { x: cx, y: cy }).catch(() => {});
              await new Promise((r) => setTimeout(r, 250));

              // 3. Playwright synthetic click
              await loc.click({ timeout: 3500 }).catch(() => {});
              clicked = true;
              break;
            }
          }
        } catch {}
      }
    }

    // Strategy 3: In-page DOM search fallback by innerText or aria-label
    if (!clicked) {
      try {
        const coords = await page.evaluate((txt) => {
          const els = Array.from(document.querySelectorAll('button, a, input, [role="button"], [role="link"], span, div, h1, h2, h3, h4'));
          for (const el of els) {
            const inner = (el as HTMLElement).innerText?.trim() || el.getAttribute("aria-label") || el.getAttribute("title") || "";
            if (inner.toLowerCase().includes(txt.toLowerCase()) && el.children.length <= 3) {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) {
                el.scrollIntoView({ behavior: "instant", block: "center" });
                const rAfter = el.getBoundingClientRect();
                return { x: Math.round(rAfter.x + rAfter.width / 2), y: Math.round(rAfter.y + rAfter.height / 2) };
              }
            }
          }
          return null;
        }, cleanTarget);

        if (coords) {
          await desktopController.moveAndClickAtViewport(coords.x, coords.y, true);
          await page.evaluate(({ x, y }) => {
            // @ts-ignore
            window.__showLauncherGhostCursor?.(x, y);
            // @ts-ignore
            window.__triggerLauncherRipple?.();
          }, coords).catch(() => {});
          await page.mouse.click(coords.x, coords.y);
          clicked = true;
        }
      } catch {}
    }

    // Fallback: direct CSS selector
    if (!clicked) {
      try {
        await page.click(cleanTarget, { timeout: 2500 });
        clicked = true;
      } catch {}
    }

    await page.waitForLoadState("domcontentloaded", { timeout: 6000 }).catch(() => {});
    await this.ensureGhostCursorInPage(page);

    const title = await page.title();
    const currentUrl = page.url();
    const contentSummary = await this.extractTextSummary(page);
    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

    return {
      success: clicked,
      url: currentUrl,
      title,
      contentSummary,
      screenshot,
    };
  }

  /**
   * Play media (YouTube video or Spotify track) automatically
   */
  public async playMedia(params: {
    platform: "youtube" | "spotify";
    query?: string;
    url?: string;
  }): Promise<{
    success: boolean;
    url: string;
    title: string;
    videoTitle?: string;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});
    await this.ensureGhostCursorInPage(page);

    if (params.platform === "youtube") {
      const searchUrl =
        params.url ||
        (params.query
          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(params.query)}`
          : "https://www.youtube.com");

      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});

      // Dismiss cookie/consent banner if any
      try {
        const consentBtn = page.locator('button[aria-label*="Accept"], button:has-text("Accept all"), button:has-text("Setuju"), button:has-text("I agree"), ytd-button-renderer:has-text("Reject"), ytd-button-renderer:has-text("Accept")').first();
        if (await consentBtn.isVisible({ timeout: 1500 })) {
          await consentBtn.click().catch(() => {});
          await new Promise((r) => setTimeout(r, 600));
        }
      } catch {}

      let clickedVideoTitle = "";
      // Click first video result
      try {
        const videoSelector = page.locator('ytd-video-renderer a#video-title, ytd-video-renderer a#thumbnail, #contents ytd-video-renderer a#video-title').first();
        await videoSelector.waitFor({ state: "visible", timeout: 8000 });
        clickedVideoTitle = (await videoSelector.innerText().catch(() => "")) || "";

        const box = await videoSelector.boundingBox();
        if (box) {
          await page.evaluate(({ x, y }) => {
            // @ts-ignore
            window.__showLauncherGhostCursor?.(x, y);
          }, { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) }).catch(() => {});
          await new Promise((r) => setTimeout(r, 500));
          await page.evaluate(() => {
            // @ts-ignore
            window.__triggerLauncherRipple?.();
          }).catch(() => {});
        }

        await videoSelector.click({ timeout: 6000 });
        await page.waitForLoadState("domcontentloaded", { timeout: 8000 }).catch(() => {});
        await new Promise((r) => setTimeout(r, 1200));

        // Click play button on the player if paused
        try {
          const playButton = page.locator('button.ytp-play-button, .html5-video-player').first();
          if (await playButton.isVisible({ timeout: 2000 })) {
            const isPaused = await page.evaluate(() => {
              const v = document.querySelector("video");
              return v ? v.paused : false;
            }).catch(() => false);
            if (isPaused) {
              await playButton.click().catch(() => {});
            }
          }
        } catch {}
      } catch (err) {
        console.warn("[Playwright] YouTube auto-play video click warning:", err);
      }

      const finalUrl = page.url();
      const finalTitle = (await page.title()) || clickedVideoTitle || "YouTube Video";
      const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

      return {
        success: true,
        url: finalUrl,
        title: finalTitle,
        videoTitle: clickedVideoTitle,
        screenshot,
      };
    } else {
      // Spotify
      const searchUrl =
        params.url ||
        (params.query
          ? `https://open.spotify.com/search/${encodeURIComponent(params.query)}`
          : "https://open.spotify.com");

      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});

      // Dismiss cookie banner
      try {
        const cookieBtn = page.locator('button#onetrust-accept-btn-handler, button:has-text("Accept Cookies"), button:has-text("Close")').first();
        if (await cookieBtn.isVisible({ timeout: 1500 })) {
          await cookieBtn.click().catch(() => {});
        }
      } catch {}

      // Click play button or top result
      try {
        const playBtn = page.locator('[data-testid="play-button"], button[aria-label*="Play"], [data-testid="top-result-card"] button').first();
        await playBtn.waitFor({ state: "visible", timeout: 7000 });
        const box = await playBtn.boundingBox();
        if (box) {
          await page.evaluate(({ x, y }) => {
            // @ts-ignore
            window.__showLauncherGhostCursor?.(x, y);
          }, { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) }).catch(() => {});
          await new Promise((r) => setTimeout(r, 500));
        }
        await playBtn.click({ timeout: 5000 });
        await new Promise((r) => setTimeout(r, 1200));
      } catch {}

      const finalUrl = page.url();
      const finalTitle = await page.title();
      const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

      return {
        success: true,
        url: finalUrl,
        title: finalTitle,
        screenshot,
      };
    }
  }

  /**
   * Scroll page smoothly up or down with live Ghost Cursor reaction
   */
  public async scroll(direction: "up" | "down" = "down", amount: number = 550): Promise<{
    success: boolean;
    url: string;
    title: string;
    contentSummary: string;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});
    await this.ensureGhostCursorInPage(page);

    const deltaY = direction === "down" ? amount : -amount;
    await page.evaluate((d) => {
      window.scrollBy({ top: d, behavior: "smooth" });
    }, deltaY).catch(() => {});

    await new Promise((r) => setTimeout(r, 600));

    const title = await page.title();
    const url = page.url();
    const contentSummary = await this.extractTextSummary(page);
    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);
    return {
      success: true,
      url,
      title,
      contentSummary,
      screenshot,
    };
  }

  /**
   * Scans an entire webpage by smoothly scrolling down through all sections to the bottom (footer),
   * triggering all animations and lazy-loaded content, and then smoothly gliding back to the top.
   */
  public async fullPageScanScroll(): Promise<{
    success: boolean;
    url: string;
    title: string;
    contentSummary: string;
    textSummary?: string;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});
    await this.ensureGhostCursorInPage(page);

    // 1. Progressively scroll down through all sections until reaching the bottom
    let previousScrollY = -1;
    let stuckCount = 0;
    const maxSteps = 24;

    for (let step = 0; step < maxSteps; step++) {
      const scrollState = await page.evaluate(() => {
        const docH = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          1000
        );
        const winH = window.innerHeight || 800;
        const currentY = window.scrollY || window.pageYOffset || 0;
        const stepAmount = Math.max(350, Math.round(winH * 0.72));
        const maxScroll = Math.max(0, docH - winH);
        const nextY = Math.min(currentY + stepAmount, docH);

        window.scrollTo({ top: nextY, behavior: "smooth" });
        return {
          currentY,
          nextY,
          docH,
          maxScroll,
          isNearBottom: currentY >= maxScroll - 60,
        };
      }).catch(() => null);

      if (!scrollState) break;
      desktopController.scroll("down", 4).catch(() => {});
      await new Promise((r) => setTimeout(r, 700));

      const actualY = await page.evaluate(() => window.scrollY || window.pageYOffset || 0).catch(() => 0);
      if (actualY <= previousScrollY + 15) {
        stuckCount++;
      } else {
        stuckCount = 0;
      }
      previousScrollY = actualY;

      // If at bottom or scroll position is no longer moving down after initial steps
      if (scrollState.isNearBottom || (stuckCount >= 2 && step >= 2)) {
        break;
      }
    }

    // 2. Explicitly bring footer into view to guarantee footer is seen
    await page.evaluate(() => {
      const footer = document.querySelector('footer, [role="contentinfo"], [class*="footer" i], [id*="footer" i]');
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      }
    }).catch(() => {});
    desktopController.scroll("down", 6).catch(() => {});
    // Pause briefly at footer so the user can clearly see the bottom was reached
    await new Promise((r) => setTimeout(r, 1200));

    // 3. Langsung kembali ke hero section / posisi teratas tanpa scroll bertahap
    await page.evaluate(() => {
      const hero = document.querySelector('header, main, [class*="hero" i], [id*="hero" i], h1');
      if (hero && typeof hero.scrollIntoView === "function") {
        hero.scrollIntoView({ behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }).catch(() => {});

    // Beri waktu animasi kembali ke hero section selesai dengan mulus
    await new Promise((r) => setTimeout(r, 850));

    // Pastikan posisi absolut di hero section (top = 0)
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 250));

    const title = await page.title();
    const url = page.url();
    const contentSummary = await this.extractTextSummary(page);
    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

    return {
      success: true,
      url,
      title,
      contentSummary,
      textSummary: contentSummary,
      screenshot,
    };
  }

  /**
   * Type text into an input or active element with Ghost Typing
   */
  public async typeText(target: string, text: string): Promise<{
    success: boolean;
    url: string;
    title: string;
    contentSummary: string;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});
    await this.ensureGhostCursorInPage(page);

    let typed = false;
    try {
      let locator = page.locator(`input[placeholder*="${target}" i], input[name*="${target}" i], textarea, input[type="text"], input[type="search"]`).first();
      if (!await locator.isVisible({ timeout: 2000 })) {
        locator = page.locator('input:not([type="hidden"]), textarea').first();
      }

      if (await locator.isVisible({ timeout: 2000 })) {
        const box = await locator.boundingBox();
        if (box) {
          const cx = Math.round(box.x + box.width / 2);
          const cy = Math.round(box.y + box.height / 2);
          await desktopController.moveAndClickAtViewport(cx, cy, true);
          await page.evaluate(({ x, y }) => {
            // @ts-ignore
            window.__showLauncherGhostCursor?.(x, y);
          }, { x: cx, y: cy }).catch(() => {});
          await new Promise((r) => setTimeout(r, 250));
        }

        await locator.click({ timeout: 3000 });
        await locator.fill(text, { timeout: 3000 });
        desktopController.typeText(text).catch(() => {});
        typed = true;
      }
    } catch {}

    if (!typed) {
      try {
        await page.keyboard.type(text, { delay: 40 });
        desktopController.typeText(text).catch(() => {});
        typed = true;
      } catch {}
    }

    await new Promise((r) => setTimeout(r, 300));

    const title = await page.title();
    const url = page.url();
    const contentSummary = await this.extractTextSummary(page);
    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

    return {
      success: typed,
      url,
      title,
      contentSummary,
      screenshot,
    };
  }

  /**
   * Extract rich structured interactive elements snapshot (links, buttons, inputs) with exact pixel boxes
   */
  public async getDOMSnapshot(): Promise<{
    url: string;
    title: string;
    interactiveElements: Array<{
      index: number;
      tag: string;
      text: string;
      role?: string;
      selector?: string;
      box?: { x: number; y: number; width: number; height: number };
    }>;
    contentSummary: string;
    textSummary?: string;
    screenshot?: string;
  }> {
    const page = await this.getPage();
    await page.bringToFront().catch(() => {});

    const title = await page.title();
    const url = page.url();

    const interactiveElements = await page.evaluate(() => {
      const items: Array<{
        index: number;
        tag: string;
        text: string;
        role?: string;
        selector?: string;
        box?: { x: number; y: number; width: number; height: number };
      }> = [];
      const nodes = Array.from(document.querySelectorAll('a[href], button, input:not([type="hidden"]), textarea, select, [role="button"], [role="link"], h1, h2, h3'));
      let counter = 1;

      for (const el of nodes) {
        if (counter > 40) break;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === "none") continue;

        const text = (el as HTMLElement).innerText?.trim() || (el as HTMLInputElement).placeholder || (el as HTMLInputElement).value || el.getAttribute("aria-label") || el.getAttribute("title") || "";
        if (!text && el.tagName.toLowerCase() !== "input") continue;

        items.push({
          index: counter++,
          tag: el.tagName.toLowerCase(),
          text: text.slice(0, 80),
          role: el.getAttribute("role") || undefined,
          selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(" ")[0]}` : el.tagName.toLowerCase(),
          box: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        });
      }

      return items;
    }).catch(() => []);

    const contentSummary = await this.extractTextSummary(page);
    const screenshot = await this.captureOnDemandScreenshot().catch(() => undefined);

    return {
      url,
      title,
      interactiveElements,
      contentSummary,
      textSummary: contentSummary,
      screenshot,
    };
  }

  /**
   * Capture a SINGLE screenshot on-demand (only when explicitly requested by user)
   */
  public async captureOnDemandScreenshot(): Promise<string> {
    const page = await this.getPage();
    await page.evaluate(() => {
      const el = document.getElementById("__launcher_ai_ghost_cursor__");
      if (el) el.style.display = "none";
    }).catch(() => {});
    const buffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }

  /**
   * Extract comprehensive readable text from current page (Headings, meta, paragraphs, feature cards)
   */
  public async extractTextSummary(page: Page): Promise<string> {
    try {
      return await page.evaluate(() => {
        // 1. Meta Description
        const metaDesc = document.querySelector('meta[name="description"], meta[property="og:description"]')?.getAttribute("content")?.trim() || "";

        // 2. All Headings
        const headings: string[] = [];
        document.querySelectorAll("h1, h2, h3, h4").forEach((h) => {
          const t = (h as HTMLElement).innerText?.trim();
          if (t && t.length > 3 && !headings.includes(t)) {
            headings.push(t);
          }
        });

        // 3. Readable Text Blocks (paragraphs, list items, card texts, descriptions)
        const contentBlocks: string[] = [];
        const seenTexts = new Set<string>();

        const contentNodes = document.querySelectorAll("p, article, section, li, [class*='feature' i], [class*='card' i], [class*='desc' i], [class*='text' i]");
        for (const node of Array.from(contentNodes)) {
          // Avoid deeply nested duplicates
          if (node.children.length > 3) continue;
          const text = (node as HTMLElement).innerText?.trim();
          if (!text || text.length < 15 || text.length > 1000) continue;
          if (seenTexts.has(text)) continue;

          // Exclude header/footer navigation items
          if (node.closest("nav, header")) continue;

          seenTexts.add(text);
          contentBlocks.push(text);
          if (contentBlocks.length >= 35) break;
        }

        const sections = [
          metaDesc ? `[Meta Ringkasan]: ${metaDesc}` : "",
          headings.length > 0 ? `[Judul & Subjudul Halaman]:\n${headings.slice(0, 15).join(" | ")}` : "",
          contentBlocks.length > 0 ? `[Isi Informasi & Fitur Halaman]:\n${contentBlocks.join("\n\n")}` : "",
        ].filter(Boolean);

        return sections.join("\n\n").slice(0, 6000);
      });
    } catch {
      return "Gagal mengekstrak teks halaman.";
    }
  }

  /**
   * Get current browser status
   */
  public getStatus(): { isReady: boolean; lastActivity: number } {
    return {
      isReady: !!this.page && !this.page.isClosed(),
      lastActivity: this.lastActivity,
    };
  }

  /**
   * Close browser on shutdown
   */
  public async close(): Promise<void> {
    if (this.context) {
      await this.context.close().catch(() => {});
      this.context = null;
      this.page = null;
      this.browser = null;
    }
  }
}

// Global singleton instance preserved across Next.js reloads
const globalForBrowser = globalThis as unknown as {
  __launcher_playwright_service?: PlaywrightBrowserService;
};

if (!globalForBrowser.__launcher_playwright_service) {
  globalForBrowser.__launcher_playwright_service = new PlaywrightBrowserService();
} else {
  Object.setPrototypeOf(globalForBrowser.__launcher_playwright_service, PlaywrightBrowserService.prototype);
}

export const playwrightBrowser = globalForBrowser.__launcher_playwright_service;
