"""Static checks for the plain HTML site. Uses lxml from the bundled runtime."""
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qs
from html.parser import HTMLParser
from lxml import html
import re

ROOT = Path(__file__).resolve().parents[1]
pages = {p.name: html.fromstring(p.read_text(encoding='utf-8')) for p in ROOT.glob('*.html')}
errors = []
void = set('area base br col embed hr img input link meta param source track wbr'.split())

class Nesting(HTMLParser):
    def __init__(self, name):
        super().__init__(); self.stack = []; self.name = name
    def handle_starttag(self, tag, attrs):
        if tag not in void: self.stack.append(tag)
    def handle_startendtag(self, tag, attrs): pass
    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag:
            errors.append(f'{self.name}: unmatched closing {tag}, stack={self.stack[-4:]}')
        else: self.stack.pop()

for name, doc in pages.items():
    source = (ROOT / name).read_text(encoding='utf-8')
    parser = Nesting(name); parser.feed(source)
    if parser.stack: errors.append(f'{name}: unclosed elements {parser.stack}')
    ids = doc.xpath('//@id')
    if len(ids) != len(set(ids)): errors.append(f'{name}: duplicate IDs')
    assert len(doc.xpath('//h1')) == 1, name
    assert len(doc.xpath('//main')) == 1, name
    assert doc.get('lang') == ('en' if name.endswith('-en.html') or name == 'terms.html' else 'hu'), name
    assert doc.xpath('//title/text()') and doc.xpath('//meta[@name="description"]/@content'), name
    assert doc.xpath('//footer//a[@href="aszf.html"]') and doc.xpath('//footer//a[@href="terms.html"]'), (name, 'bilingual terms links')
    for el in doc.xpath('//*[@aria-labelledby or @aria-describedby or @aria-controls]'):
        for attr in ('aria-labelledby', 'aria-describedby', 'aria-controls'):
            for target in el.get(attr, '').split():
                if target not in ids: errors.append(f'{name}: missing {attr} target {target}')
    for el in doc.xpath('//*[@href or @src]'):
        if el.tag == 'base': continue  # A URL base is a directory, not a file.
        uri = urlsplit(el.get('href') or el.get('src'))
        if uri.scheme or uri.netloc: continue
        target = unquote(uri.path) or name
        if not (ROOT / target).is_file(): errors.append(f'{name}: missing file {target}')
        if uri.fragment and target in pages:
            if unquote(uri.fragment) not in pages[target].xpath('//@id'):
                errors.append(f'{name}: missing anchor {target}#{uri.fragment}')
    for label in doc.xpath('//label[@for]'):
        assert label.get('for') in ids, (name, label.get('for'))
    assert not doc.xpath('//img[not(@alt)]'), name
    for photo in doc.xpath('//img'):
        assert photo.get('width') and photo.get('height'), (name, 'image dimensions')
        assert photo.get('sizes') and photo.get('srcset'), (name, 'responsive image hints')
        for candidate in photo.get('srcset').split(','):
            image_path, descriptor = candidate.strip().split()
            assert (ROOT / image_path).is_file() and re.fullmatch(r'\d+w', descriptor), (name, candidate)
        assert (ROOT / photo.get('data-full-src')).is_file(), (name, 'full image link')
    assert any(urlsplit(href).path == 'responsive.css' for href in doc.xpath('//link[@rel="stylesheet"]/@href')), (name, 'device stylesheet')
    index = doc.xpath('//main/nav[@class="section-nav"]')
    if name in ('404.html', '404-en.html'):
        assert not index, 'A recovery page does not need a section index'
        assert doc.xpath('//base/@href') == ['/'], 'Nested error paths must resolve to the site root'
        assert doc.xpath('//meta[@name="robots"]/@content') == ['noindex']
        continue
    assert len(index) == 1, (name, 'missing section index inside main')
    indexed = index[0].xpath('.//a/@href')
    sections = doc.xpath('//main/section')
    assert indexed == ['#' + section.get('id') for section in sections], (name, 'section index order or coverage')
    for item, section in zip(index[0].xpath('.//li'), sections):
        assert ('hidden' in item.attrib) == ('hidden' in section.attrib), (name, 'conditional section visibility')
        assert section.get('tabindex') == '-1', (name, 'anchor focus target')
    assert doc.xpath('//script[@src="section-nav.js"]') and doc.xpath('//link[@href="section-nav.css"]'), name
    for pattern in ('Blank text', 'fejlődést garantálok', 'Kovács Anna', 'Napi üzenetváltás'):
        assert pattern not in source, (name, pattern)

contact = pages['contact.html']
email_links = contact.xpath('//a[contains(@href,"mail.google.com")]')
assert len(email_links) == 6, 'contact email routes'
assert not contact.xpath('//a[starts-with(@href,"mailto:")]'), 'contact must not depend on a desktop mail handler'
for link in email_links:
    assert parse_qs(urlsplit(link.get('href')).query).get('to') == ['mihaly.bence.fitness@gmail.com']
    assert link.get('target') == '_blank'

for css_file in ROOT.glob('*.css'):
    css = css_file.read_text(encoding='utf-8')
    css = re.sub(r'/\*.*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', '', css, flags=re.S)
    assert css.count('{') == css.count('}'), (css_file.name, 'CSS braces')
assert not errors, '\n'.join(errors)
print(f'PASS: {len(pages)} pages; HTML nesting, links, anchors, labels, metadata, image alt text, CSS braces and copy checks.')
