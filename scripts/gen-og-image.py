"""Generate og-image.png for ToolPort (1200x630px)"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630

# Colors (ToolPort brand)
BG_TOP    = (0, 81, 71)    # #005147
BG_BOT    = (0, 107, 94)   # #006b5e
CARD_BG   = (255, 255, 255, 26)  # white 10%
WHITE     = (255, 255, 255)
WHITE_60  = (255, 255, 255, 153)
ACCENT    = (100, 220, 200)

img = Image.new("RGB", (W, H), BG_TOP)
draw = ImageDraw.Draw(img, "RGBA")

# Gradient background (simple vertical)
for y in range(H):
    t = y / H
    r = int(BG_TOP[0] + (BG_BOT[0] - BG_TOP[0]) * t)
    g = int(BG_TOP[1] + (BG_BOT[1] - BG_TOP[1]) * t)
    b = int(BG_TOP[2] + (BG_BOT[2] - BG_TOP[2]) * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Subtle grid dots
for x in range(0, W, 60):
    for y in range(0, H, 60):
        draw.ellipse([x-2, y-2, x+2, y+2], fill=(255, 255, 255, 20))

# Decorative circles
draw.ellipse([900, -100, 1400, 400], fill=(255, 255, 255, 8))
draw.ellipse([980, -60, 1380, 340], fill=(255, 255, 255, 6))
draw.ellipse([-200, 300, 300, 800], fill=(255, 255, 255, 6))

# Tool pill badges (top area)
badges = [
    ("File Transfer", 80),
    ("QR Code",       300),
    ("Clipboard",     490),
]
for label, x in badges:
    bw = 180
    bh = 40
    by = 80
    draw.rounded_rectangle([x, by, x+bw, by+bh], radius=20, fill=(255, 255, 255, 30))
    try:
        fnt_sm = ImageFont.truetype("arial.ttf", 18)
    except:
        fnt_sm = ImageFont.load_default()
    draw.text((x + bw//2, by + bh//2), label, font=fnt_sm, fill=WHITE, anchor="mm")

# Main logo area
# "T" wordmark circle
cx, cy, cr = 140, 330, 72
draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=(255, 255, 255, 30))
try:
    fnt_logo = ImageFont.truetype("arialbd.ttf", 72)
except:
    try:
        fnt_logo = ImageFont.truetype("arial.ttf", 72)
    except:
        fnt_logo = ImageFont.load_default()
draw.text((cx, cy), "T", font=fnt_logo, fill=WHITE, anchor="mm")

# Main headline
try:
    fnt_title = ImageFont.truetype("arialbd.ttf", 68)
    fnt_sub   = ImageFont.truetype("arial.ttf", 30)
    fnt_tag   = ImageFont.truetype("arial.ttf", 22)
except:
    fnt_title = ImageFont.load_default()
    fnt_sub   = fnt_title
    fnt_tag   = fnt_title

draw.text((240, 295), "ToolPort", font=fnt_title, fill=WHITE, anchor="lm")
draw.text((244, 365), "Simple tools, done right.", font=fnt_sub, fill=(255, 255, 255, 200), anchor="lm")

# Divider
draw.line([(80, 430), (1120, 430)], fill=(255, 255, 255, 40), width=1)

# Feature tags bottom row
features = [
    "End-to-End Encrypted",
    "No Install Required",
    "No Signup Needed",
    "Works in Any Browser",
]
fx = 80
for feat in features:
    fw = 250
    draw.rounded_rectangle([fx, 460, fx+fw, 500], radius=10, fill=(255, 255, 255, 20))
    draw.text((fx + fw//2, 480), feat, font=fnt_tag, fill=WHITE, anchor="mm")
    fx += fw + 20

# Domain badge bottom right
draw.text((1120, 580), "toolport.dev", font=fnt_sub, fill=(255, 255, 255, 120), anchor="rm")

# Save
out = os.path.join(os.path.dirname(__file__), "..", "public", "og-image.png")
img.save(out, "PNG", optimize=True)
print(f"Saved to {os.path.abspath(out)}")
print(f"Size: {img.size}")
