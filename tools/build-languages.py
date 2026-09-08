"""Build static English pages from Hungarian originals and the reviewed translation inventory.

Run after source edits. New source text deliberately fails until its translation is supplied.
"""
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from lxml import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PAIRS = dict(zip(
    ['index.html', 'services.html', 'szemelyi-edzes.html', 'online-coaching.html', 'about.html', 'sikerek.html', 'elso-alkalom.html', 'contact.html', 'aszf.html'],
    ['index-en.html', 'services-en.html', 'personal-training-en.html', 'online-coaching-en.html', 'about-en.html', 'progress-en.html', 'first-visit-en.html', 'contact-en.html', 'terms.html']))
ATTRS = ['alt', 'title', 'aria-label', 'placeholder', 'data-note', 'data-label']
inventory = json.loads((ROOT / 'tools/translation-inventory.json').read_text(encoding='utf-8'))
translations = json.loads((ROOT / 'tools/english-translations.json').read_text(encoding='utf-8'))
LOOKUP = {entry['hu']: translations[str(entry['id'])] for entry in inventory}

def translate(value):
    key = re.sub(r'\s+', ' ', value).strip()
    if not key or not re.search(r'[A-Za-zÀ-ž]', key):
        return value
    if key not in LOOKUP:
        raise ValueError('Missing English translation: ' + key)
    return re.match(r'^\s*', value).group() + LOOKUP[key] + re.search(r'\s*$', value).group()

def strip_language_ui(source):
    source = re.sub(r'<nav class="language-switch".*?</nav>\s*', '', source, flags=re.S)
    source = re.sub(r'<link[^>]+(?:href="language\.css[^\"]*"|rel="alternate")[^>]*>\s*', '', source)
    return re.sub(r'<script src="language\.js[^\"]*"[^>]*></script>\s*', '', source)

def decorate(source, hu, en, lang):
    source = strip_language_ui(source)
    flags = {
        'hu': '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><path fill="#ce2939" d="M0 0h30v7H0z"></path><path fill="#fff" d="M0 7h30v6H0z"></path><path fill="#477050" d="M0 13h30v7H0z"></path></svg>',
        'en': '<svg viewBox="0 0 60 30" aria-hidden="true" focusable="false"><path fill="#012169" d="M0 0h60v30H0z"></path><path stroke="#fff" stroke-width="6" d="m0 0 60 30M60 0 0 30"></path><path fill="#c8102e" d="M0 0v2.2L25.6 15H30zM60 0h-4.4L30 12.8V15zM60 30v-2.2L34.4 15H30zM0 30h4.4L30 17.2V15z"></path><path stroke="#fff" stroke-width="10" d="M30 0v30M0 15h60"></path><path stroke="#c8102e" stroke-width="6" d="M30 0v30M0 15h60"></path></svg>'}
    switch = '<nav class="language-switch" data-selected="' + lang + '" aria-label="' + ('Language' if lang == 'en' else 'Nyelvválasztás') + '">'
    for code, path, label in [('hu', hu, 'Magyar'), ('en', en, 'English')]:
        current = ' aria-current="page"' if code == lang else ''
        switch += f'<a href="{path}" data-language="{code}" lang="{code}" hreflang="{code}" aria-label="{label}" title="{label}"{current}>{flags[code]}<span>{code.upper()}</span></a>'
    switch += '</nav>\n  '
    source = source.replace('<button class="hamburger"', switch + '<button class="hamburger"', 1)
    source = source.replace('</head>', f'<link rel="alternate" hreflang="hu" href="{hu}">\n<link rel="alternate" hreflang="en" href="{en}">\n<link rel="stylesheet" href="language.css?v=15.4">\n</head>')
    source = re.sub(r'href="styles\.css(?:\?[^\"]*)?"', 'href="styles.css?v=15.4"', source)
    source = re.sub(r'<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>\s*', '', source)
    source = source.replace('</head>', '<link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48">\n<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">\n<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">\n</head>')
    source = re.sub(r'src="script\.js(?:\?[^\"]*)?"', 'src="script.js?v=15.3"', source)
    return source.replace('</body>', '<script src="language.js?v=15.4"></script>\n</body>')

def remap_links(doc):
    for link in doc.xpath('//a[@href]'):
        if link.get('hreflang') or link.xpath('ancestor::nav[@class="footer-legal"]'):
            continue
        url = urlsplit(link.get('href'))
        if not url.scheme and not url.netloc and url.path in PAIRS:
            link.set('href', urlunsplit(('', '', PAIRS[url.path], url.query, url.fragment)))

def serialise(doc):
    return '<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n'

def build():
    output = {}
    for hu, en in PAIRS.items():
        source = strip_language_ui((ROOT / hu).read_text(encoding='utf-8'))
        output[hu] = decorate(source, hu, en, 'hu')
        if hu == 'aszf.html':
            doc = html.fromstring(strip_language_ui((ROOT / en).read_text(encoding='utf-8')))
            for p in doc.xpath('//p'):
                if p.text == 'The terms are available in both languages. The main website pages are in Hungarian.':
                    p.text = 'The terms are available in Hungarian and English.'
        else:
            doc = html.fromstring(source)
            for node in doc.xpath('//text()[not(ancestor::script) and not(ancestor::style)]'):
                parent = node.getparent()
                if node.is_tail:
                    parent.tail = translate(str(node))
                else:
                    parent.text = translate(str(node))
            for el in doc.iter():
                if not isinstance(el.tag, str):
                    continue
                for attr in ATTRS:
                    if el.get(attr):
                        el.set(attr, translate(el.get(attr)))
            for meta in doc.xpath('//meta[@name="description"]'):
                meta.set('content', translate(meta.get('content')))
            for amount in doc.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," price-amount ")]'):
                if amount.text:
                    amount.text = amount.text.replace('HUF ', 'HUF\u00a0')
            # Punctuation can follow a price span without the Hungarian source's space.
            for el in doc.iter():
                if el.tail and re.match(r'^\s+[,.]', el.tail):
                    el.tail = el.tail.lstrip()
                # Hungarian suffixes can directly follow inline price/strong spans;
                # their English replacements are separate words.
                if el.tail and re.match(r'^[A-Za-z]', el.tail) and re.search(r'[\w)]$', el.text_content()):
                    el.tail = ' ' + el.tail
            if hu == 'elso-alkalom.html':
                for amount in doc.xpath('//span[@class="price-amount"]'):
                    if amount.text == 'HUF\u00a0100,000' and amount.tail == '.':
                        amount.tail = ' for ten sessions.'
        doc.set('lang', 'en')
        remap_links(doc)
        output[en] = decorate(serialise(doc), hu, en, 'en')
    # Validate every translation before writing any output.
    for name, source in output.items():
        (ROOT / name).write_text(source, encoding='utf-8')
    print(f'Built {len(output)} bilingual pages with matching language links.')
    import subprocess
    import sys
    subprocess.run([sys.executable, str(ROOT / 'tools/build-404.py')], check=True)

if __name__ == '__main__':
    build()
