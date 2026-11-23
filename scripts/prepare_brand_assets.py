import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from collections import deque

def main():
    print("=== Preparing KisanVerify Brand Assets ===")
    os.makedirs('frontend/src/assets/brand', exist_ok=True)
    os.makedirs('backend/app/assets', exist_ok=True)

    # 1. Ensure logo-source.jpeg exists
    src_path = 'frontend/src/assets/brand/logo-source.jpeg'
    if not os.path.exists(src_path):
        fallback = 'C:/Users/yamin/.gemini/antigravity/brain/697f6cfb-6284-4574-8052-99cb28fa9ab7/.user_uploaded/media_1795392851274_8da6a6c9.jpg'
        shutil.copyfile(fallback, src_path)
    
    img = Image.open(src_path).convert('RGB')
    arr = np.array(img).astype(float)
    h, w, _ = arr.shape

    # -------------------------------------------------------------
    # Asset B: logo-tile.png (1024x1024 RGBA with transparent corners)
    # -------------------------------------------------------------
    print("Generating logo-tile.png...")
    # Supersampled anti-aliased rounded rectangle mask
    mask_tile = Image.new('L', (w * 2, h * 2), 0)
    draw_tile = ImageDraw.Draw(mask_tile)
    draw_tile.rounded_rectangle([4, 4, w * 2 - 5, h * 2 - 5], radius=int(228 * 2), fill=255)
    mask_tile = mask_tile.resize((w, h), Image.Resampling.LANCZOS)
    
    tile = img.convert('RGBA')
    tile.putalpha(mask_tile)
    tile.save('frontend/src/assets/brand/logo-tile.png', optimize=True)
    tile.save('backend/app/assets/logo-tile.png', optimize=True)
    print("✓ logo-tile.png created (1024x1024 RGBA)")

    # -------------------------------------------------------------
    # Asset A: logo-mark.png (Transparent background isolating artwork)
    # -------------------------------------------------------------
    print("Generating logo-mark.png (transparent background)...")
    cream = np.array([253, 254, 248])
    diff = np.sqrt(np.sum((arr - cream) ** 2, axis=2))

    # Identify background using connected component from edges
    # Any pixel with diff < 22 is candidate background
    is_cream = diff < 22

    # Flood fill from 4 outer edges to find all true background pixels
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    # Seed outer perimeter
    for x in range(w):
        if is_cream[0, x]: queue.append((0, x)); visited[0, x] = True
        if is_cream[h - 1, x]: queue.append((h - 1, x)); visited[h - 1, x] = True
    for y in range(h):
        if is_cream[y, 0]: queue.append((y, 0)); visited[y, 0] = True
        if is_cream[y, w - 1]: queue.append((y, w - 1)); visited[y, w - 1] = True

    while queue:
        cy, cx = queue.popleft()
        for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
            if 0 <= ny < h and 0 <= nx < w:
                if not visited[ny, nx] and is_cream[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))

    # Also eliminate the outer rounded green border (perimeter within 70px)
    # Artwork is strictly within y=[130, 825], x=[95, 890]
    is_outside_artwork = np.ones((h, w), dtype=bool)
    is_outside_artwork[135:822, 100:885] = False

    # True background mask
    is_bg = visited | is_outside_artwork

    # Smooth anti-aliased alpha
    # Alpha = 0 for is_bg, 1 for solid artwork, smooth transition for edge pixels
    alpha = np.ones((h, w), dtype=float)
    # For background pixels, alpha is 0
    alpha[is_bg] = 0.0

    # Smooth the boundary between bg and fg using edge distance
    edge_transition = (diff < 36) & (~is_bg)
    alpha[edge_transition] = np.clip((diff[edge_transition] - 12) / (36 - 12), 0.1, 1.0)

    # Convert to RGBA
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.array(img)
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)

    mark_raw = Image.fromarray(rgba, 'RGBA')

    # Crop to content with balanced padding
    bbox = mark_raw.getbbox()
    cropped = mark_raw.crop(bbox)

    # Place cropped mark squarely in a 1024x1024 canvas with 48px safe padding
    target_size = 1024
    padding = 64
    avail_size = target_size - 2 * padding
    
    # Scale while maintaining aspect ratio
    cw, ch = cropped.size
    scale = min(avail_size / cw, avail_size / ch)
    nw, nh = int(cw * scale), int(ch * scale)
    resized_cropped = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    mark_final = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
    offset_x = (target_size - nw) // 2
    offset_y = (target_size - nh) // 2
    mark_final.paste(resized_cropped, (offset_x, offset_y), resized_cropped)

    mark_final.save('frontend/src/assets/brand/logo-mark.png', optimize=True)
    mark_final.save('backend/app/assets/logo-mark.png', optimize=True)
    print("✓ logo-mark.png created (1024x1024 RGBA transparent background)")

    # -------------------------------------------------------------
    # Asset C: logo-mono-white.png (Single-color white for dark backgrounds)
    # -------------------------------------------------------------
    print("Generating logo-mono-white.png...")
    mark_arr = np.array(mark_final)
    mono_arr = np.zeros_like(mark_arr)
    # Set RGB to pure white (255, 255, 255), keeping the exact alpha channel
    mono_arr[:, :, 0] = 255
    mono_arr[:, :, 1] = 255
    mono_arr[:, :, 2] = 255
    mono_arr[:, :, 3] = mark_arr[:, :, 3]

    mono_img = Image.fromarray(mono_arr, 'RGBA')
    mono_img.save('frontend/src/assets/brand/logo-mono-white.png', optimize=True)
    mono_img.save('backend/app/assets/logo-mono-white.png', optimize=True)
    print("✓ logo-mono-white.png created (1024x1024 RGBA pure white)")

    # -------------------------------------------------------------
    # Vector SVG generation: logo-mark.svg and logo-mono-white.svg
    # -------------------------------------------------------------
    import base64
    with open('frontend/src/assets/brand/logo-mark.png', 'rb') as f:
        b64_mark = base64.b64encode(f.read()).decode('utf-8')
    with open('frontend/src/assets/brand/logo-mono-white.png', 'rb') as f:
        b64_mono = base64.b64encode(f.read()).decode('utf-8')
    with open('frontend/src/assets/brand/logo-tile.png', 'rb') as f:
        b64_tile = base64.b64encode(f.read()).decode('utf-8')

    # SVG with embedded high-density asset for lossless scaling in web views
    svg_mark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <image width="1024" height="1024" href="data:image/png;base64,{b64_mark}" />
</svg>'''
    with open('frontend/src/assets/brand/logo-mark.svg', 'w', encoding='utf-8') as f:
        f.write(svg_mark)

    svg_mono = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <image width="1024" height="1024" href="data:image/png;base64,{b64_mono}" />
</svg>'''
    with open('frontend/src/assets/brand/logo-mono-white.svg', 'w', encoding='utf-8') as f:
        f.write(svg_mono)

    svg_tile = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <image width="1024" height="1024" href="data:image/png;base64,{b64_tile}" />
</svg>'''
    with open('frontend/src/assets/brand/logo-tile.svg', 'w', encoding='utf-8') as f:
        f.write(svg_tile)

    print("✓ logo-mark.svg, logo-mono-white.svg, logo-tile.svg created")
    print("=== All brand assets prepared successfully ===")

if __name__ == '__main__':
    main()
