import { NextRequest, NextResponse } from "next/server";
import { playwrightBrowser } from "@/lib/browser/playwrightService";

export const runtime = "nodejs";

// GET /api/agentic-vision/page-view - Serves 100% genuine live HTML from Playwright Chrome
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    const page = await playwrightBrowser.getPage();

    // If targetUrl provided and different from current, navigate
    if (targetUrl) {
      const currentUrl = page.url();
      if (currentUrl !== targetUrl) {
        await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      }
    }

    const currentUrl = page.url() || "https://www.google.com";
    let html = await page.content();
    let origin = "https://www.google.com";
    try {
      origin = new URL(currentUrl).origin;
    } catch {}

    // Inject base href so all real Google images, styles, and assets resolve properly
    const baseTag = `<base href="${origin}/">`;
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>${baseTag}`);
    } else if (html.includes("<head ")) {
      html = html.replace(/<head\b[^>]*>/, `$&${baseTag}`);
    } else {
      html = `${baseTag}${html}`;
    }

    // Inject communication bridge for link clicks, search form submits, ghost typing, and element tracking
    const bridgeScript = `
<script>
  (function() {
    // 1. Intercept clicks on links
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a');
      if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'LAUNCHER_BROWSER_NAVIGATE', url: a.href }, '*');
      }
    }, true);

    // 2. Intercept search form submission
    document.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var input = document.querySelector('input[name="q"], textarea[name="q"]');
      if (input && input.value) {
        window.parent.postMessage({ type: 'LAUNCHER_BROWSER_SEARCH', query: input.value }, '*');
      }
    }, true);

    // 3. Bidirectional AI Agent Commands from Launcher OS Parent
    window.addEventListener('message', function(e) {
      if (!e.data || typeof e.data !== 'object') return;

      // Locate Element Coordinates for AI Cursor
      if (e.data.type === 'LAUNCHER_LOCATE_ELEMENT') {
        var target = e.data.target;
        var el = null;
        if (target === 'search_input') {
          el = document.querySelector('input[name="q"], textarea[name="q"], input[type="text"]');
        } else if (target === 'search_btn') {
          el = document.querySelector('input[name="btnK"], input[value="Penelusuran Google"], button[type="submit"], input[type="submit"]');
        } else if (target === 'first_result') {
          el = document.querySelector('#search a h3, h3, a[href*="http"] h3, div[data-sokoban-container] a');
          if (el && el.closest('a')) el = el.closest('a');
        }

        if (el) {
          var rect = el.getBoundingClientRect();
          window.parent.postMessage({
            type: 'LAUNCHER_ELEMENT_COORDS',
            target: target,
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
            title: el.innerText || el.textContent || el.value || ''
          }, '*');
        } else {
          window.parent.postMessage({ type: 'LAUNCHER_ELEMENT_COORDS_FAILED', target: target }, '*');
        }
      }

      // Ghost Typing Character-by-Character
      else if (e.data.type === 'LAUNCHER_GHOST_TYPE') {
        var textToType = e.data.text || '';
        var input = document.querySelector('input[name="q"], textarea[name="q"], input[type="text"]');
        if (!input) {
          window.parent.postMessage({ type: 'LAUNCHER_GHOST_TYPE_DONE', text: textToType, error: 'No input found' }, '*');
          return;
        }

        input.focus();
        input.value = '';
        var idx = 0;
        var speed = e.data.speed || 60; // ms per character

        function typeNextChar() {
          if (idx < textToType.length) {
            input.value += textToType[idx];
            idx++;
            // Dispatch native input events so Google suggests / updates
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            window.parent.postMessage({
              type: 'LAUNCHER_GHOST_TYPING_PROGRESS',
              current: input.value,
              progress: idx / textToType.length
            }, '*');

            setTimeout(typeNextChar, speed);
          } else {
            window.parent.postMessage({ type: 'LAUNCHER_GHOST_TYPE_DONE', text: textToType }, '*');
          }
        }

        setTimeout(typeNextChar, 100);
      }

      // Submit Search
      else if (e.data.type === 'LAUNCHER_SUBMIT_SEARCH') {
        var input = document.querySelector('input[name="q"], textarea[name="q"], input[type="text"]');
        var query = e.data.query || (input ? input.value : '');
        window.parent.postMessage({ type: 'LAUNCHER_BROWSER_SEARCH', query: query }, '*');
      }

      // Click First Result Link
      else if (e.data.type === 'LAUNCHER_CLICK_FIRST_RESULT') {
        var link = document.querySelector('#search a h3, h3, a[href*="http"] h3, div[data-sokoban-container] a');
        if (link) {
          var a = link.closest('a') || link;
          if (a.href) {
            window.parent.postMessage({ type: 'LAUNCHER_BROWSER_NAVIGATE', url: a.href }, '*');
          } else {
            a.click();
          }
        }
      }
    });
  })();
</script>
`;

    if (html.includes("</body>")) {
      html = html.replace("</body>", `${bridgeScript}</body>`);
    } else {
      html += bridgeScript;
    }

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("PageView error:", err);
    // Fallback: Real Google homepage via fetch
    try {
      const res = await fetch("https://www.google.com", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      });
      let rawHtml = await res.text();
      rawHtml = rawHtml.replace("<head>", `<head><base href="https://www.google.com/">`);
      return new Response(rawHtml, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("<h1>Gagal memuat Google</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }
}
