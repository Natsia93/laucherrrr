import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface DisplayInfo {
  width: number;
  height: number;
}

class LinuxDesktopController {
  private displayEnv = process.env.DISPLAY || ":0";

  private get cmdPrefix(): string {
    return `DISPLAY=${this.displayEnv}`;
  }

  /**
   * Check if xdotool is installed and usable
   */
  public async isAvailable(): Promise<boolean> {
    try {
      await execAsync(`${this.cmdPrefix} which xdotool`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current display resolution
   */
  public async getDisplayResolution(): Promise<DisplayInfo> {
    try {
      const { stdout } = await execAsync(`${this.cmdPrefix} xdotool getdisplaygeometry`);
      const [wStr, hStr] = stdout.trim().split(/\s+/);
      return {
        width: parseInt(wStr, 10) || 1366,
        height: parseInt(hStr, 10) || 768,
      };
    } catch {
      return { width: 1366, height: 768 };
    }
  }

  /**
   * Get current cursor position
   */
  public async getMousePosition(): Promise<ScreenPoint> {
    try {
      const { stdout } = await execAsync(`${this.cmdPrefix} xdotool getmouselocation`);
      const xMatch = stdout.match(/x:(\d+)/);
      const yMatch = stdout.match(/y:(\d+)/);
      return {
        x: xMatch ? parseInt(xMatch[1], 10) : 600,
        y: yMatch ? parseInt(yMatch[1], 10) : 400,
      };
    } catch {
      return { x: 600, y: 400 };
    }
  }

  /**
   * Move mouse smoothly from current position to (targetX, targetY)
   */
  public async smoothMoveMouse(targetX: number, targetY: number, steps: number = 18): Promise<void> {
    try {
      const current = await this.getMousePosition();
      const dx = targetX - current.x;
      const dy = targetY - current.y;

      for (let i = 1; i <= steps; i++) {
        // Smooth easing (cubic ease-out)
        const t = i / steps;
        const ease = 1 - Math.pow(1 - t, 3);
        const nextX = Math.round(current.x + dx * ease);
        const nextY = Math.round(current.y + dy * ease);

        await execAsync(`${this.cmdPrefix} xdotool mousemove ${nextX} ${nextY}`);
        await new Promise((r) => setTimeout(r, 12));
      }

      // Ensure final exact point
      await execAsync(`${this.cmdPrefix} xdotool mousemove ${targetX} ${targetY}`);
    } catch (err: any) {
      console.warn("[DesktopController] smoothMoveMouse warning:", err.message);
    }
  }

  /**
   * Click mouse at optional coordinates (left button by default)
   */
  public async click(x?: number, y?: number, button: number = 1): Promise<void> {
    try {
      if (typeof x === "number" && typeof y === "number") {
        await this.smoothMoveMouse(x, y);
      }
      await new Promise((r) => setTimeout(r, 60));
      await execAsync(`${this.cmdPrefix} xdotool click ${button}`);
    } catch (err: any) {
      console.warn("[DesktopController] click warning:", err.message);
    }
  }

  /**
   * Type text character-by-character into the active window
   */
  public async typeText(text: string, delayMs: number = 45): Promise<void> {
    try {
      // Escape special characters for shell
      const escaped = text.replace(/(["\\$`])/g, "\\$1");
      await execAsync(`${this.cmdPrefix} xdotool type --delay ${delayMs} "${escaped}"`);
    } catch (err: any) {
      console.warn("[DesktopController] typeText warning:", err.message);
    }
  }

  /**
   * Press a single key (e.g. Return, space, k, Escape, Tab, BackSpace)
   */
  public async pressKey(key: string): Promise<void> {
    try {
      await execAsync(`${this.cmdPrefix} xdotool key ${key}`);
    } catch (err: any) {
      console.warn("[DesktopController] pressKey warning:", err.message);
    }
  }

  /**
   * Bring Google Chrome window to front and focus it
   */
  public async focusChrome(): Promise<boolean> {
    try {
      await execAsync(`${this.cmdPrefix} xdotool search --onlyvisible --class google-chrome windowactivate`);
      await new Promise((r) => setTimeout(r, 300));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Open URL in Chrome on user's desktop
   */
  public async openUrl(url: string): Promise<void> {
    try {
      const cleanUrl = url.replace(/"/g, '\\"');
      await execAsync(`${this.cmdPrefix} google-chrome "${cleanUrl}" || xdg-open "${cleanUrl}"`);
    } catch (err: any) {
      console.warn("[DesktopController] openUrl warning:", err.message);
    }
  }

  /**
   * Scroll active window (direction: "up" | "down", clicks: number)
   */
  public async scroll(direction: "up" | "down" = "down", clicks: number = 6): Promise<void> {
    try {
      const button = direction === "down" ? 5 : 4;
      await execAsync(`${this.cmdPrefix} xdotool click --repeat ${clicks} --delay 40 ${button}`);
    } catch (err: any) {
      console.warn("[DesktopController] scroll warning:", err.message);
    }
  }

  /**
   * Get Chrome window position and dimensions on Linux desktop
   */
  public async getChromeWindowBounds(): Promise<{ x: number; y: number; width: number; height: number; topOffset: number }> {
    try {
      const { stdout } = await execAsync(`${this.cmdPrefix} xdotool search --onlyvisible --class google-chrome`);
      const winId = stdout.trim().split(/\s+/)[0];
      if (winId) {
        const { stdout: geomOut } = await execAsync(`${this.cmdPrefix} xdotool getwindowgeometry ${winId}`);
        const posMatch = geomOut.match(/Position:\s*(\d+),(\d+)/);
        const sizeMatch = geomOut.match(/Geometry:\s*(\d+)x(\d+)/);
        const x = posMatch ? parseInt(posMatch[1], 10) : 0;
        const y = posMatch ? parseInt(posMatch[2], 10) : 0;
        const width = sizeMatch ? parseInt(sizeMatch[1], 10) : 1366;
        const height = sizeMatch ? parseInt(sizeMatch[2], 10) : 768;
        // Standard Chrome UI: tabs + omnibox + bookmarks bar ≈ 112px
        return { x, y, width, height, topOffset: 112 };
      }
    } catch {}
    return { x: 0, y: 0, width: 1366, height: 768, topOffset: 112 };
  }

  /**
   * Move mouse to exact webpage viewport coordinates within Chrome and optionally click
   */
  public async moveAndClickAtViewport(viewportX: number, viewportY: number, shouldClick: boolean = true): Promise<void> {
    try {
      await this.focusChrome();
      const bounds = await this.getChromeWindowBounds();
      const screenX = Math.min(bounds.width - 5, Math.max(bounds.x + 5, bounds.x + viewportX));
      const screenY = Math.min(bounds.height - 5, Math.max(bounds.y + bounds.topOffset, bounds.y + bounds.topOffset + viewportY));
      await this.smoothMoveMouse(screenX, screenY);
      if (shouldClick) {
        await new Promise((r) => setTimeout(r, 60));
        await execAsync(`${this.cmdPrefix} xdotool click 1`);
      }
    } catch (err: any) {
      console.warn("[DesktopController] moveAndClickAtViewport warning:", err.message);
    }
  }

  /**
   * Autonomous media player on Linux Desktop:
   * 1. Resolves video URL or query
   * 2. Opens Chrome directly to YouTube / Spotify
   * 3. Focuses Chrome window
   * 4. Glides mouse smoothly to the player/first video
   * 5. Clicks and triggers playback (key 'k' / space)
   */
  public async playMedia(params: {
    platform: "youtube" | "spotify";
    query?: string;
    url?: string;
  }): Promise<{ success: boolean; url: string; title: string }> {
    const { platform, query = "lofi chill music", url } = params;
    const res = await this.getDisplayResolution();

    let targetUrl = url;

    if (platform === "youtube") {
      if (!targetUrl) {
        // Try resolving direct video watch link for immediate instant playback
        try {
          const { stdout } = await execAsync(
            `curl -s "https://www.youtube.com/results?search_query=${encodeURIComponent(query)}" | grep -o 'watch?v=[^"& ]*' | head -n 1`
          );
          const rawMatch = stdout.trim();
          if (rawMatch) {
            const cleanPath = rawMatch.split("\\u0026")[0];
            targetUrl = `https://www.youtube.com/${cleanPath}`;
          }
        } catch {}

        if (!targetUrl) {
          targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        }
      }

      // Launch or open in Google Chrome
      await this.openUrl(targetUrl);
      await new Promise((r) => setTimeout(r, 2200));

      // Bring Chrome to front
      await this.focusChrome();
      await new Promise((r) => setTimeout(r, 600));

      // Calculate smooth target point on user screen
      // If direct watch URL: middle-left player area
      // If search results: first video thumbnail position
      const isWatchUrl = targetUrl.includes("watch?v=");
      const targetX = isWatchUrl ? Math.round(res.width * 0.45) : Math.round(res.width * 0.32);
      const targetY = isWatchUrl ? Math.round(res.height * 0.46) : Math.round(res.height * 0.38);

      // Smooth mouse glide across screen
      await this.smoothMoveMouse(targetX, targetY, 22);
      await new Promise((r) => setTimeout(r, 350));

      // Click to focus player
      await execAsync(`${this.cmdPrefix} xdotool click 1`);
      await new Promise((r) => setTimeout(r, 500));

      // Press 'k' (YouTube play shortcut) and 'space' to guarantee audio/video playback
      await this.pressKey("k");
      await new Promise((r) => setTimeout(r, 300));

      return {
        success: true,
        url: targetUrl,
        title: `Playing YouTube: ${query}`,
      };
    } else {
      // Spotify Web Player
      targetUrl = targetUrl || `https://open.spotify.com/search/${encodeURIComponent(query)}`;
      await this.openUrl(targetUrl);
      await new Promise((r) => setTimeout(r, 2200));
      await this.focusChrome();

      const targetX = Math.round(res.width * 0.4);
      const targetY = Math.round(res.height * 0.42);
      await this.smoothMoveMouse(targetX, targetY, 22);
      await execAsync(`${this.cmdPrefix} xdotool click 1`);

      return {
        success: true,
        url: targetUrl,
        title: `Playing Spotify: ${query}`,
      };
    }
  }

  /**
   * Interactive demonstration of signature ghost cursor movement across the real OS desktop
   */
  public async testCursorGlide(): Promise<void> {
    const res = await this.getDisplayResolution();
    const centerX = Math.round(res.width / 2);
    const centerY = Math.round(res.height / 2);

    // 1. Move to upper left quadrant
    await this.smoothMoveMouse(Math.round(res.width * 0.25), Math.round(res.height * 0.3), 15);
    await new Promise((r) => setTimeout(r, 200));

    // 2. Glide smoothly to center
    await this.smoothMoveMouse(centerX, centerY, 20);
    await new Promise((r) => setTimeout(r, 250));

    // 3. Glide to lower right quadrant
    await this.smoothMoveMouse(Math.round(res.width * 0.65), Math.round(res.height * 0.6), 18);
    await new Promise((r) => setTimeout(r, 200));

    // 4. Return to center and simulate soft click
    await this.smoothMoveMouse(centerX, centerY, 15);
  }
}

export const desktopController = new LinuxDesktopController();
