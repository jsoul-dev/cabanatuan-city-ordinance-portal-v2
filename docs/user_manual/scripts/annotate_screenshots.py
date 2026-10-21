#!/usr/bin/env python3
"""
Screenshot Annotation Engine for Cabanatuan City Ordinance Portal User Manual.
Uses Python Pillow to programmatically annotate screenshots with:
  - 100% transparent interior (0% tint opacity) so underlying UI text is completely legible
  - Crisp, professional 2px emerald outlines (#10B981)
  - Numbered circular badges (white outer border, drop shadow, vibrant emerald fill)
  - Clear, anti-aliased typographic numbers mapped 1:1 to manual steps.
Preserves original unannotated screenshots in screenshots/original/.
"""

import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
ORIGINAL_DIR = BASE_DIR / "screenshots" / "original"
ANNOTATED_DIR = BASE_DIR / "screenshots" / "annotated"
CONFIG_FILE = BASE_DIR / "config" / "annotations_config.json"

# Color Palette (Emerald civic theme)
STROKE_COLOR = (16, 185, 129, 255)       # #10B981 Crisp Emerald Outline (2px)
FILL_TINT_COLOR = None                    # 0% opacity (Completely transparent, NO wash/tint)
BADGE_FILL = (4, 120, 87, 255)            # #047857 Dark Emerald Solid
BADGE_BORDER = (255, 255, 255, 255)       # Pure White Border Ring
BADGE_SHADOW = (0, 0, 0, 110)             # Subtle Drop Shadow
TEXT_COLOR = (255, 255, 255, 255)         # Pure White Number

def load_fonts():
    """Load high-legibility bold Windows font for badges."""
    font_paths = [
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                badge_font = ImageFont.truetype(p, 14)
                small_font = ImageFont.truetype(p, 12)
                return badge_font, small_font
            except Exception:
                continue
    default = ImageFont.load_default()
    return default, default

def draw_badge(draw, cx, cy, radius, num_str, font):
    """Draw a professional anti-aliased badge with drop shadow and white border."""
    # 1. Subtle Drop Shadow
    draw.ellipse(
        [cx - radius + 1, cy - radius + 2, cx + radius + 1, cy + radius + 2],
        fill=BADGE_SHADOW
    )
    # 2. White Outer Ring (2px thick)
    draw.ellipse(
        [cx - radius - 1, cy - radius - 1, cx + radius + 1, cy + radius + 1],
        fill=BADGE_BORDER
    )
    # 3. Inner Solid Emerald Circle
    draw.ellipse(
        [cx - radius + 1, cy - radius + 1, cx + radius - 1, cy + radius - 1],
        fill=BADGE_FILL
    )
    # 4. Centered White Number
    bbox = draw.textbbox((0, 0), num_str, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw / 2
    ty = cy - th / 2 - 1
    draw.text((tx, ty), num_str, font=font, fill=TEXT_COLOR)

def annotate_screenshot(screen_key, screen_data, badge_font, small_font):
    role = screen_data.get("role")
    filename = screen_data.get("filename")
    annotated_filename = screen_data.get("annotatedFilename")
    elements = screen_data.get("elements", [])

    orig_path = ORIGINAL_DIR / role / filename
    out_dir = ANNOTATED_DIR / role
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / annotated_filename

    if not orig_path.exists():
        print(f"  ⚠️ Warning: Original file not found: {orig_path}")
        return False

    with Image.open(orig_path) as im:
        img_rgba = im.convert("RGBA")
        width, height = img_rgba.size

        # Create overlay layer for transparent tints and anti-aliased shapes
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        placed_badges = []

        for item in elements:
            num = item.get("num", 1)
            box = item.get("box", {})
            if not box:
                continue

            bx = max(2, min(width - 10, box.get("x", 0)))
            by = max(2, min(height - 10, box.get("y", 0)))
            bw = min(width - bx - 2, box.get("width", 50))
            bh = min(height - by - 2, box.get("height", 30))

            if bw <= 4 or bh <= 4:
                continue

            # Draw highlight rectangle with rounded corners (No fill tint, 100% transparent interior)
            r = min(6, bw // 4, bh // 4)
            draw.rounded_rectangle(
                [bx, by, bx + bw, by + bh],
                radius=r,
                fill=None,
                outline=STROKE_COLOR,
                width=2
            )

            # Badge Position: Top-left of the bounding box, resting neatly on the corner
            badge_r = 13
            bcx = bx
            bcy = by - 6 if by >= 18 else by + 10

            # Clamp inside viewport
            bcx = max(badge_r + 4, min(width - badge_r - 4, bcx))
            bcy = max(badge_r + 4, min(height - badge_r - 4, bcy))

            # Collision check with previously placed badges
            for (px, py) in placed_badges:
                dist_sq = (bcx - px) ** 2 + (bcy - py) ** 2
                if dist_sq < (badge_r * 2.2) ** 2:
                    # Shift badge to top right or bottom
                    bcx = min(width - badge_r - 4, bx + bw - badge_r)
                    bcy = max(badge_r + 4, by - 6)
                    break

            placed_badges.append((bcx, bcy))
            draw_badge(draw, bcx, bcy, badge_r, str(num), badge_font)

        # Composite overlay onto original image
        annotated_img = Image.alpha_composite(img_rgba, overlay)
        # Convert to RGB and save with high quality
        annotated_img.convert("RGB").save(out_path, "PNG", optimize=True)
        print(f"  ✓ Annotated [{role}] {filename} -> {annotated_filename}")
        return True

def main():
    print("=======================================================")
    print("  🎨 ANNOTATING APPLICATION SCREENSHOTS (CLEAN & CRISP)")
    print("=======================================================\n")

    if not CONFIG_FILE.exists():
        print(f"[!] Error: Config file not found: {CONFIG_FILE}")
        sys.exit(1)

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)

    badge_font, small_font = load_fonts()
    screenshots = config.get("screenshots", {})
    count = 0

    for key, data in screenshots.items():
        if annotate_screenshot(key, data, badge_font, small_font):
            count += 1

    print(f"\n[OK] Successfully annotated {count} screenshots cleanly!")
    print(f"Output directory: {ANNOTATED_DIR}")

if __name__ == "__main__":
    main()
