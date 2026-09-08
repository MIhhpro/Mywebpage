"""Render the existing MB circle at high resolution and in favicon sizes."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
font_path = ROOT / 'tools/fonts/BarlowCondensed-ExtraBold.ttf'
# Supersampling keeps the small icon and the larger downloadable image crisp.
factor = 3
canvas = Image.new('RGBA', (1024 * factor, 1024 * factor), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)
draw.ellipse(tuple(v * factor for v in (82, 82, 942, 942)), fill='#100f0c', outline='#b69a30', width=24 * factor)
typeface = ImageFont.truetype(str(font_path), 300 * factor)
left_m, top_m, _, bottom_m = typeface.getbbox('M', anchor='ls')
_, top_b, right_b, bottom_b = typeface.getbbox('B', anchor='ls')
second_x = typeface.getlength('M') + 15 * factor
position = (1024 * factor - (left_m + second_x + right_b)) / 2
baseline = (1024 * factor - (min(top_m, top_b) + max(bottom_m, bottom_b))) / 2
for char in 'MB':
    draw.text((position, baseline), char, font=typeface, fill='#f5c842', anchor='ls')
    position += typeface.getlength(char) + 15 * factor
# Fit the circular mark to the asset, retaining a tiny transparent allowance
# for its antialiased edge. The black fill exists only inside the gold ring.
canvas = canvas.crop(tuple(v * factor for v in (80, 80, 944, 944)))
logo = canvas.resize((1024, 1024), Image.Resampling.LANCZOS)
logo.save(ROOT / 'assets/mb-logo-1024.png', optimize=True)
logo.resize((32, 32), Image.Resampling.LANCZOS).save(ROOT / 'assets/favicon-32.png')
logo.resize((180, 180), Image.Resampling.LANCZOS).save(ROOT / 'assets/apple-touch-icon.png')
logo.resize((256, 256), Image.Resampling.LANCZOS).save(ROOT / 'favicon.ico', sizes=[(16,16),(32,32),(48,48)])
print('Created 1024px MB logo, 32px PNG, Apple touch icon and ICO favicon.')
