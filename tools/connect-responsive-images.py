"""Attach generated image sizes and the responsive stylesheet without reformatting pages."""
from pathlib import Path
from html import escape
from lxml import html
import re

ROOT = Path(__file__).resolve().parents[1]
for page in ROOT.glob('*.html'):
    source = page.read_text(encoding='utf-8')
    if not re.search(r'href="responsive\.css(?:\?[^\"]*)?"', source):
        source = source.replace('<link rel="stylesheet" href="section-nav.css" />', '<link rel="stylesheet" href="section-nav.css" />\n  <link rel="stylesheet" href="responsive.css" />')
    source = source.replace('content="width=device-width, initial-scale=1.0"', 'content="width=device-width, initial-scale=1.0, viewport-fit=cover"')
    def update(match):
        tag = match.group()
        element = html.fromstring(tag)
        original = element.get('src', '')
        if not original.startswith('assets/') or not original.endswith('.png'): return tag
        stem = Path(original).stem
        copies = sorted((ROOT / 'assets/responsive').glob(stem + '-*.webp'), key=lambda p: int(p.stem.split('-')[-1]))
        assert copies, original
        candidates = [(p.relative_to(ROOT).as_posix(), int(p.stem.split('-')[-1])) for p in copies]
        largest = candidates[-1][0]
        fallback = next((p for p, w in candidates if w >= 640), largest)
        if page.name == 'contact.html':
            sizes = '(max-width: 380px) 64px, (max-width: 420px) 80px, 112px'
        elif page.name in ('index.html', 'services.html'):
            sizes = '(max-width: 520px) calc(100vw - 48px), (max-width: 1040px) 520px, 520px'
        elif page.name == 'about.html' and stem == 'professional':
            sizes = '(max-width: 600px) calc(100vw - 72px), 520px'
        elif page.name == 'about.html':
            sizes = '(max-width: 520px) calc(100vw - 72px), (max-width: 800px) 45vw, 380px'
        else:
            sizes = '(max-width: 640px) calc(100vw - 72px), 520px'
        attrs = {
            'src': fallback,
            'srcset': ', '.join(f'{p} {w}w' for p, w in candidates),
            'sizes': sizes,
            'data-full-src': largest,
            'loading': 'eager' if page.name in ('index.html', 'services.html') else 'lazy',
            'decoding': 'async',
        }
        if page.name in ('index.html', 'services.html'): attrs['fetchpriority'] = 'high'
        for name, value in attrs.items():
            pattern = rf'\s{re.escape(name)}="[^"]*"'
            tag = re.sub(pattern, '', tag)
            tag = re.sub(r'\s*/?>$', lambda m: f' {name}="{escape(value, quote=True)}"' + m.group(), tag)
        return tag
    source = re.sub(r'<img\b[^>]*>', update, source)
    page.write_text(source, encoding='utf-8')
