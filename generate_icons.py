#!/usr/bin/env python3
"""Generate PWA icons from dl3.png with dark slate background, amber border, and fire emoji."""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

def main():
    src = Path("C:/Users/CHARA/Downloads/dl3.png")
    out_dir = Path("C:/Users/CHARA/Documents/kimi/workspace/deutsch-lernen-pwa/public")
    
    if not src.exists():
        print(f"ERROR: Source image not found: {src}")
        sys.exit(1)
    
    # Load source image
    img = Image.open(src).convert("RGBA")
    
    # Crop to square (center)
    w, h = img.size
    size = min(w, h)
    left = (w - size) // 2
    top = (h - size) // 2
    img = img.crop((left, top, left + size, top + size))
    
    BG = "#0f172a"      # deep slate blue
    BORDER = "#f59e0b"  # amber
    
    def composite_onto_bg(src_img, bg_color, target_size):
        """Composite src_img onto a solid background so transparent areas fill with bg_color."""
        bg = Image.new("RGBA", target_size, bg_color)
        bg.paste(src_img, (0, 0), src_img)
        return bg
    
    def make_standard(size_px, corner_radius=None):
        """Standard icon: rounded rect bg + centered image + amber border + fire emoji."""
        if corner_radius is None:
            corner_radius = size_px // 8
        
        canvas = Image.new("RGBA", (size_px, size_px), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # Draw rounded rect background
        border_width = max(1, size_px // 64)
        draw.rounded_rectangle(
            [(0, 0), (size_px - 1, size_px - 1)],
            radius=corner_radius,
            fill=BG,
            outline=BORDER,
            width=border_width
        )
        
        # Calculate image placement (centered with slight top bias for fire room)
        img_size = int(size_px * 0.74)
        img_resized = img.resize((img_size, img_size), Image.LANCZOS)
        
        # Composite onto solid background to fill transparent areas
        img_composite = composite_onto_bg(img_resized, BG, (img_size, img_size))
        
        # Create rounded mask for the image
        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([(0, 0), (img_size - 1, img_size - 1)], radius=corner_radius // 2, fill=255)
        
        img_x = (size_px - img_size) // 2
        img_y = (size_px - img_size) // 2 - size_px // 32  # slightly up
        
        canvas.paste(img_composite, (img_x, img_y), mask=mask)
        
        # Add fire emoji in bottom right
        fire_size = max(size_px // 8, 14)
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", fire_size)
        except:
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", fire_size)
            except:
                font = ImageFont.load_default()
        
        fire_text = "🔥"
        bbox = draw.textbbox((0, 0), fire_text, font=font)
        fw = bbox[2] - bbox[0]
        fh = bbox[3] - bbox[1]
        fx = size_px - fw - size_px // 12
        fy = size_px - fh - size_px // 16
        
        # Draw fire with slight shadow
        draw.text((fx + 1, fy + 1), fire_text, fill=(0, 0, 0, 128), font=font)
        draw.text((fx, fy), fire_text, fill="white", font=font)
        
        return canvas
    
    def make_maskable(size_px):
        """Maskable icon: full-bleed image with safe zone."""
        canvas = Image.new("RGBA", (size_px, size_px), (0, 0, 0, 0))
        
        # Fill background circle
        draw = ImageDraw.Draw(canvas)
        margin = size_px // 20
        draw.ellipse(
            [(margin, margin), (size_px - margin - 1, size_px - margin - 1)],
            fill=BG,
            outline=BORDER,
            width=max(1, size_px // 64)
        )
        
        # Scale image to fit inside safe zone (65% of canvas)
        safe = int(size_px * 0.65)
        img_resized = img.resize((safe, safe), Image.LANCZOS)
        img_composite = composite_onto_bg(img_resized, BG, (safe, safe))
        
        img_x = (size_px - safe) // 2
        img_y = (size_px - safe) // 2 - size_px // 40
        
        # Circular mask for image
        mask = Image.new("L", (safe, safe), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([(0, 0), (safe - 1, safe - 1)], fill=255)
        
        canvas.paste(img_composite, (img_x, img_y), mask=mask)
        
        # Fire emoji (bottom right, inside safe zone)
        fire_size = max(size_px // 10, 14)
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", fire_size)
        except:
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", fire_size)
            except:
                font = ImageFont.load_default()
        
        fire_text = "🔥"
        bbox = draw.textbbox((0, 0), fire_text, font=font)
        fw = bbox[2] - bbox[0]
        fh = bbox[3] - bbox[1]
        fx = size_px - fw - size_px // 8
        fy = size_px - fh - size_px // 10
        
        draw.text((fx + 1, fy + 1), fire_text, fill=(0, 0, 0, 128), font=font)
        draw.text((fx, fy), fire_text, fill="white", font=font)
        
        return canvas
    
    # Generate all sizes
    configs = [
        ("icon-512x512.png", 512, "standard"),
        ("icon-192x192.png", 192, "standard"),
        ("icon-180x180.png", 180, "standard"),
        ("icon-32x32.png", 32, "standard"),
        ("maskable-512x512.png", 512, "maskable"),
        ("maskable-192x192.png", 192, "maskable"),
    ]
    
    for filename, size_px, kind in configs:
        if kind == "standard":
            icon = make_standard(size_px)
        else:
            icon = make_maskable(size_px)
        
        out_path = out_dir / filename
        icon.save(out_path, "PNG")
        print(f"Generated: {out_path} ({size_px}x{size_px})")
    
    print("\nAll icons regenerated with background fill!")

if __name__ == "__main__":
    main()
