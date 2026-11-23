import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def main():
    print("=== Generating KisanVerify Favicons, PWA & Social Icons ===")
    public_dir = os.path.abspath('frontend/public')
    os.makedirs(public_dir, exist_ok=True)

    tile_path = 'frontend/src/assets/brand/logo-tile.png'
    mark_path = 'frontend/src/assets/brand/logo-mark.png'

    if not os.path.exists(tile_path):
        raise FileNotFoundError(f"Missing master asset: {tile_path}")

    tile_img = Image.open(tile_path).convert('RGBA')
    mark_img = Image.open(mark_path).convert('RGBA') if os.path.exists(mark_path) else tile_img

    # 1. Favicon ICO (multi-size: 16, 32, 48)
    ico_path = os.path.join(public_dir, 'favicon.ico')
    # Save multi-resolution ico using tile_img
    tile_img.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"✓ Generated: {ico_path}")

    # 2. Apple Touch Icon (180x180)
    apple_path = os.path.join(public_dir, 'apple-touch-icon.png')
    apple_img = tile_img.resize((180, 180), Image.Resampling.LANCZOS)
    apple_img.save(apple_path, optimize=True)
    print(f"✓ Generated: {apple_path}")

    # 3. PWA Icon 192x192
    pwa192_path = os.path.join(public_dir, 'icon-192.png')
    pwa192_img = tile_img.resize((192, 192), Image.Resampling.LANCZOS)
    pwa192_img.save(pwa192_path, optimize=True)
    print(f"✓ Generated: {pwa192_path}")

    # 4. PWA Icon 512x512
    pwa512_path = os.path.join(public_dir, 'icon-512.png')
    pwa512_img = tile_img.resize((512, 512), Image.Resampling.LANCZOS)
    pwa512_img.save(pwa512_path, optimize=True)
    print(f"✓ Generated: {pwa512_path}")

    # 5. PWA Maskable Icon 512x512 (Safe-zone with 15% padding on cream background #F7F5EC)
    maskable_path = os.path.join(public_dir, 'icon-512-maskable.png')
    # Background #F7F5EC (247, 245, 236)
    maskable_bg = Image.new('RGBA', (512, 512), (247, 245, 236, 255))
    # Inner logo scaled to 410x410 (80% safe zone)
    safe_size = int(512 * 0.8)
    inner_logo = tile_img.resize((safe_size, safe_size), Image.Resampling.LANCZOS)
    offset = (512 - safe_size) // 2
    maskable_bg.paste(inner_logo, (offset, offset), inner_logo)
    maskable_bg.save(maskable_path, optimize=True)
    print(f"✓ Generated: {maskable_path}")

    # 6. Favicon SVG & Icon SVG
    svg_source = 'frontend/src/assets/brand/logo-tile.svg'
    if os.path.exists(svg_source):
        shutil.copyfile(svg_source, os.path.join(public_dir, 'favicon.svg'))
        shutil.copyfile(svg_source, os.path.join(public_dir, 'icon.svg'))
        print(f"✓ Generated: {os.path.join(public_dir, 'favicon.svg')} and icon.svg")

    # 7. Open Graph / Social Share Image (1200x630)
    og_path = os.path.join(public_dir, 'og-image.png')
    og_w, og_h = 1200, 630
    # Canvas with cream background #F7F5EC
    og_img = Image.new('RGBA', (og_w, og_h), (247, 245, 236, 255))
    og_draw = ImageDraw.Draw(og_img)

    # Decorative background elements in tint #E4EBD6
    og_draw.ellipse([850, -100, 1350, 400], fill=(228, 235, 214, 180))
    og_draw.ellipse([-150, 350, 350, 850], fill=(228, 235, 214, 120))

    # Paste Logo Tile (size 420x420) on left side
    logo_size = 400
    og_logo = tile_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    og_img.paste(og_logo, (100, (og_h - logo_size) // 2), og_logo)

    # Right side typography
    # Header: KisanVerify
    # We will try loading system fonts or default sans-serif
    font_large = None
    font_sub = None
    font_pill = None
    
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                font_large = ImageFont.truetype(fn, 68)
                font_sub = ImageFont.truetype(fn, 28)
                font_desc = ImageFont.truetype(fn.replace('b.ttf', '.ttf').replace('bd.ttf', '.ttf'), 22)
                font_pill = ImageFont.truetype(fn, 18)
                break
            except Exception:
                pass
    
    if font_large is None:
        font_large = ImageFont.load_default()
        font_sub = font_large
        font_desc = font_large
        font_pill = font_large

    text_x = 560
    # Title: Kisan (Charcoal #1F2A1B) + Verify (Forest #4A6538)
    og_draw.text((text_x, 150), "KisanVerify", font=font_large, fill=(31, 42, 27))

    # Tagline: #5B7A47 (Olive)
    og_draw.text((text_x, 240), "Every Rupee. Every Benefit. Verified.", font=font_sub, fill=(91, 122, 71))

    # Description: #6B7565 (Muted)
    og_draw.text((text_x, 290), "Agricultural Financial Transparency & Policy Simplification Platform", font=font_desc, fill=(107, 117, 101))
    og_draw.text((text_x, 325), "Deterministic Audit for KCC Loans, MSP Mandi & PMFBY Insurance", font=font_desc, fill=(107, 117, 101))

    # 3 Pills at bottom
    pills = ["Loan Verification", "MSP Mandi Reconciled", "PMFBY Insurance Audit"]
    px = text_x
    py = 390
    for pill in pills:
        bbox = og_draw.textbbox((0, 0), pill, font=font_pill)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        pill_w = tw + 28
        pill_h = 36
        og_draw.rounded_rectangle([px, py, px + pill_w, py + pill_h], radius=18, fill=(228, 235, 214), outline=(74, 101, 56, 80))
        og_draw.text((px + 14, py + 8), pill, font=font_pill, fill=(74, 101, 56))
        px += pill_w + 14

    og_img.convert('RGB').save(og_path, optimize=True)
    print(f"✓ Generated: {og_path} (1200x630)")
    print("=== All favicons, PWA, and social share assets generated ===")

if __name__ == '__main__':
    main()
