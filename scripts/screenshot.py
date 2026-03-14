#!/usr/bin/env python3
"""Take a screenshot of The-Current using Playwright (Python).

Usage:
  python3 scripts/screenshot.py --url http://localhost:3000 --out shots/home.png --full
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Playwright screenshot helper")
    parser.add_argument("--url", default="http://localhost:3000", help="Page URL")
    parser.add_argument("--out", default="shots/home.png", help="Output file path")
    parser.add_argument("--width", type=int, default=1440, help="Viewport width")
    parser.add_argument("--height", type=int, default=900, help="Viewport height")
    parser.add_argument("--full", action="store_true", help="Capture full page")
    parser.add_argument("--wait", type=int, default=1500, help="Extra wait in ms after load")
    parser.add_argument(
        "--selector",
        default="main",
        help="Wait for selector before screenshot",
    )
    return parser.parse_args()


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except Exception as exc:  # pragma: no cover - runtime guard
        print("Playwright (Python) is not installed.")
        print("Install with: pip install playwright && python3 -m playwright install")
        print(f"Error: {exc}")
        return 1

    args = parse_args()
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": args.width, "height": args.height})
        page.goto(args.url, wait_until="networkidle")
        if args.selector:
            page.wait_for_selector(args.selector, timeout=15000)
        if args.wait:
            page.wait_for_timeout(args.wait)
        page.screenshot(path=str(out_path), full_page=args.full)
        browser.close()

    print(f"Saved screenshot to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
