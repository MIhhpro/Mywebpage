"""Build the two static terms pages. Source: terms-content.json; no network calls."""
from pathlib import Path
from html import escape
from lxml import html
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'tools/terms-content.json').read_text(encoding='utf-8'))
base = (ROOT / 'services.html').read_text(encoding='utf-8')
head = base.split('<body>')[0]
header = re.search(r'<header class="site-header">.*?</header>\s*<nav class="mobile-menu".*?</nav>', base, re.S).group()
header = header.replace(' aria-current="page"', '')
footer = re.search(r'<footer class="site-footer">.*?</footer>', base, re.S).group()

def legal_links():
    return '<nav class="footer-legal" aria-label="ÁSZF / Terms"><a href="aszf.html" lang="hu" hreflang="hu">Általános szerződési feltételek</a><a href="terms.html" lang="en" hreflang="en">Terms of Service</a></nav>'

def add_footer_links(source):
    if 'class="footer-legal"' not in source:
        source = source.replace('<div class="footer-bottom">', legal_links() + '\n  <div class="footer-bottom">')
    if 'href="legal.css' not in source:
        source = source.replace('</head>', '  <link rel="stylesheet" href="legal.css?v=15.2" />\n</head>')
    return source

# Footer links on every existing page, preserving all unrelated content.
for path in ROOT.glob('*.html'):
    path.write_text(add_footer_links(path.read_text(encoding='utf-8')), encoding='utf-8')

for lang, filename in [('hu', 'aszf.html'), ('en', 'terms.html')]:
    en = lang == 'en'
    title = 'Terms of Service' if en else 'Általános szerződési feltételek'
    intro = ('What we agree before training starts: services, appointments, communication and your rights.'
             if en else 'Amiben az edzés megkezdése előtt megállapodunk: szolgáltatások, időpontok, kapcsolattartás és a jogaid.')
    draft = ('Review draft — not yet in force' if en else 'Egyeztetési tervezet — még nem hatályos')
    draft_note = ('This version contains points still to be finalised and must not be used as the final contracting terms. You will receive the final terms before entering into a paid agreement.'
                  if en else 'Ez a változat még véglegesítendő pontokat tartalmaz, ezért végleges szerződéses feltételként nem használható. A fizetős megállapodás előtt megkapod a végleges feltételeket.')
    top = head.replace('<html lang="hu">', '<html lang="' + lang + '">')
    top = re.sub(r'<title>.*?</title>', '<title>' + title + ' | Mihály Bence</title>', top)
    top = re.sub(r'<meta name="description" content="[^"]*" />',
                 '<meta name="description" content="' + escape(intro, quote=True) + '" />', top)
    top = top.replace('</head>', '<meta name="robots" content="noindex" />\n'
                      '<link rel="alternate" hreflang="hu" href="aszf.html" />\n'
                      '<link rel="alternate" hreflang="en" href="terms.html" />\n</head>')
    page_header = header
    page_footer = footer
    if en:
        # The language builder maps these destinations to their English counterparts.
        for old, new in [
            ('Fő navigáció', 'Main navigation'), ('Mobil navigáció', 'Mobile navigation'),
            ('Lábléc navigáció', 'Footer navigation'), ('Menü megnyitása', 'Open menu'),
            ('Főoldal', 'Home'), ('Szolgáltatások', 'Services'), ('Személyi edzés', 'Personal training'),
            ('Rólam', 'About'), ('Sikerek', 'Progress'), ('Kapcsolat', 'Contact'),
            ('Beszélgessünk', 'Let’s talk'), ('Az első alkalom', 'First visit'), ('Galéria', 'Gallery')]:
            page_header = page_header.replace(old, new)
            page_footer = page_footer.replace(old, new)
    toc_label = 'On this page' if en else 'Oldal tartalma'
    sections = [('overview', 'Overview' if en else 'Áttekintés', '', '')] + data[lang]
    toc = '<nav class="section-nav" aria-label="' + toc_label + '">'
    toc += '<button class="section-nav-toggle" type="button" aria-expanded="false" aria-controls="section-nav-list" hidden>' + toc_label + '<span class="section-nav-chevron" aria-hidden="true">⌃</span></button>'
    toc += '<p class="section-nav-heading">' + toc_label + '</p><ol id="section-nav-list" class="section-nav-list">'
    for sid, label, _, _ in sections:
        toc += '<li><a href="#' + sid + '"><span class="section-nav-marker" aria-hidden="true"></span><span>' + label + '</span></a></li>'
    toc += '</ol></nav>'
    page = top + '<body class="legal-page">\n<a class="skip-link" href="#main-content">' + ('Skip to content' if en else 'Ugrás a tartalomra') + '</a>\n'
    page += page_header + '\n<main id="main-content" tabindex="-1">\n' + toc
    page += '<section class="legal-intro" id="overview" tabindex="-1" aria-labelledby="legal-title">'
    page += '<nav class="legal-languages" aria-label="' + ('Document language' if en else 'Dokumentum nyelve') + '">'
    page += '<a href="aszf.html" lang="hu" hreflang="hu"' + ('' if en else ' aria-current="page"') + '>Magyar</a>'
    page += '<a href="terms.html" lang="en" hreflang="en"' + (' aria-current="page"' if en else '') + '>English</a></nav>'
    page += '<h1 id="legal-title">' + title + '</h1><p>' + intro + '</p>'
    page += '<p>' + ('Version: ' if en else 'Változat: ') + data['version'] + '</p>'
    page += '<div class="legal-notice"><strong>' + draft + '</strong><p>' + draft_note + '</p></div>'
    page += '<div class="legal-actions"><button class="btn btn-outline" type="button" data-print-terms hidden>' + ('Print / save as PDF' if en else 'Nyomtatás / mentés PDF-ként') + '</button>'
    page += '<a class="btn btn-ghost" href="terms-' + lang + '.txt" download>' + ('Download text copy' if en else 'Szöveges példány letöltése') + '</a></div>'
    if en:
        page += '<p>The terms are available in Hungarian and English.</p>'
    page += '</section>\n'
    for sid, _, heading, content in data[lang]:
        page += '<section class="legal-section" id="' + sid + '" tabindex="-1" aria-labelledby="' + sid + '-title"><h2 id="' + sid + '-title">' + heading + '</h2>\n' + content + '\n</section>\n'
    page += '</main>\n' + page_footer + '\n<script src="script.js?v=15.2"></script>\n<script src="section-nav.js"></script>\n<script src="legal.js?v=15.2"></script>\n</body>\n</html>\n'
    (ROOT / filename).write_text(add_footer_links(page), encoding='utf-8')
    # A self-contained text copy for saving and attaching to the pre-contract email.
    text = [title, data['version'], draft, draft_note]
    for _, _, heading, content in data[lang]:
        text.extend(['', heading, ''])
        fragment = html.fragment_fromstring(content, create_parent='div')
        for block in fragment:
            if block.tag in ('ul', 'ol'):
                text.extend('- ' + ' '.join(li.text_content().split()) for li in block)
            elif block.tag == 'dl':
                text.extend(' '.join(item.text_content().split()) for item in block)
            else:
                text.append(block.text_content().strip())
            # Preserve external source/contact URLs in the downloaded copy.
            for link in block.xpath('.//a[starts-with(@href, "https://")]'):
                if 'mail.google.com' not in link.get('href'):
                    text.append(link.text_content() + ': ' + link.get('href'))
            text.append('')
    (ROOT / ('terms-' + lang + '.txt')).write_text('\n'.join(text) + '\n', encoding='utf-8')
print('Built both terms pages, downloadable copies and footer links.')
subprocess.run([sys.executable, str(ROOT / 'tools/build-languages.py')], check=True)
