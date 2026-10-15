"""
Launcher OS Native Computer Control Daemon.
Provides OS-level screen capture and mouse/keyboard automation restricted strictly to browser/Google workflows.
"""

import sys
import os
import asyncio
import logging
import re
import webbrowser
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure referensi/computer_control is in path
sys.path.append(str(Path(__file__).parent.parent / "referensi"))

from computer_control.controller import DesktopController
from computer_control.screen import ScreenCapture
from computer_control.safety import SafetyGuard

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("launcher_cc")

app = FastAPI(title="Launcher OS Computer Control Daemon", version="1.0.0")

# CORS setup for Launcher OS Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

controller = DesktopController(move_duration=0.25)
screen = ScreenCapture(max_dimension=1280, jpeg_quality=75)
safety = SafetyGuard()

# Strict guardrail: Prevent launching local computer folders, terminals, or system file managers
_RESTRICTED_APP_PATTERNS = [
    re.compile(r"^file://", re.IGNORECASE),
    re.compile(r"^/(bin|etc|var|usr|home|tmp|opt|dev|proc|sys)", re.IGNORECASE),
    re.compile(r"\b(nautilus|dolphin|thunar|pcmanfm|explorer|cmd|bash|sh|zsh|terminal|konsole)\b", re.IGNORECASE),
]

def is_safe_web_target(url_or_target: str) -> bool:
    """Strictly ensure agent only navigates to web/Google and never local filesystem or terminals."""
    for pattern in _RESTRICTED_APP_PATTERNS:
        if pattern.search(url_or_target):
            return False
    return True

@app.get("/api/computer_control/status")
async def get_status():
    w, h = screen.get_screen_size()
    cursor_x, cursor_y = await controller.get_cursor_position()
    return {
        "status": "ready",
        "resolution": {"width": w, "height": h},
        "cursor": {"x": cursor_x, "y": cursor_y},
        "engine": "Launcher OS Native OS Controller",
        "scope": "Restricted to Google & Web Navigation",
    }

@app.get("/api/computer_control/screenshot")
async def get_screenshot():
    try:
        img = await screen.capture()
        b64 = screen.image_to_base64(img)
        w, h = img.size
        return {
            "status": "ok",
            "content": b64,
            "width": w,
            "height": h,
        }
    except Exception as e:
        logger.error("Screenshot capture error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

class ActionRequest(BaseModel):
    action: str
    x: int | None = None
    y: int | None = None
    button: str = "left"
    clicks: int = 1
    text: str | None = None
    url: str | None = None
    key: str | None = None
    keys: list[str] | None = None
    direction: str = "down"
    amount: int = 3
    seconds: float = 1.0
    context: str = "Google Navigation"

@app.post("/api/computer_control/action")
async def execute_action(req: ActionRequest):
    act = req.action.lower()
    desc = ""

    try:
        if act == "click":
            x, y = req.x or 0, req.y or 0
            check = safety.check_click_safety(req.context, f"click at ({x},{y})")
            if not check.is_safe:
                return {"status": "blocked", "reason": check.reason}
            await controller.click(x, y, button=req.button, clicks=req.clicks)
            desc = f"Clicked at ({x}, {y})"

        elif act == "move":
            x, y = req.x or 0, req.y or 0
            await controller.move_to(x, y)
            desc = f"Moved to ({x}, {y})"

        elif act == "type":
            txt = req.text or ""
            check = safety.check_typing_safety(req.context, txt)
            if not check.is_safe:
                return {"status": "blocked", "reason": check.reason}
            await controller.type_text(txt)
            desc = f"Typed text: {txt[:30]}..."

        elif act == "press":
            key = req.key or "enter"
            await controller.press_key(key)
            desc = f"Pressed {key}"

        elif act == "hotkey":
            keys = req.keys or []
            check = safety.check_hotkey_safety(keys)
            if not check.is_safe:
                return {"status": "blocked", "reason": check.reason}
            await controller.hotkey(*keys)
            desc = f"Hotkey {'+'.join(keys)}"

        elif act == "scroll":
            x, y = req.x or 600, req.y or 400
            await controller.scroll(x, y, req.amount, req.direction)
            desc = f"Scrolled {req.direction}"

        elif act == "open":
            url = req.url or "https://www.google.com"
            if not is_safe_web_target(url):
                return {"status": "blocked", "reason": "Akses folder lokal atau terminal komputer diblokir demi keamanan."}
            if not url.startswith(("http://", "https://")):
                url = "https://" + url
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, webbrowser.open, url)
            desc = f"Opened Google browser: {url}"

        elif act == "wait":
            await asyncio.sleep(req.seconds)
            desc = f"Waited {req.seconds}s"

        else:
            desc = f"Unknown action: {act}"

        return {"status": "ok", "result": desc}

    except Exception as e:
        logger.error("Action execution error (%s): %s", act, e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
