"""Check every public language pair, translated surface and local navigation route."""
from pathlib import Path
from urllib.parse import urlsplit, urljoin
from lxml import html
import importlib.util
import re

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('languages', ROOT / 'tools/build-languages.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
for hu, en in builder.PAIRS.items():
    documents = [html.fromstring((ROOT / p).read_text(encoding='utf-8')) for p in [hu, en]]
    for lang, doc in zip(['hu', 'en'], documents):
        selector = doc.xpath('//header/nav[@class="language-switch"]')
        assert len(selector) == 1, (hu, lang)
        assert selector[0].xpath('./a/@href') == [hu, en]
        assert selector[0].xpath('./a[@aria-current="page"]/@lang') == [lang]
        assert doc.xpath('//link[@rel="alternate"]/@href') == [hu, en]
        assert len(selector[0].xpath('.//svg')) == 2
    assert documents[0].xpath('//main/section/@id') == documents[1].xpath('//main/section/@id'), hu
    for link in documents[1].xpath('//a[@href and not(@hreflang)]'):
        if link.xpath('ancestor::nav[@class="footer-legal"]'):
            continue
        url = urlsplit(link.get('href'))
        assert url.scheme or url.netloc or url.path not in builder.PAIRS, (en, link.get('href'))
    if hu != 'aszf.html':
        # Full translation coverage, including labels and gallery popout captions.
        values = documents[1].xpath('//text()[not(ancestor::script) and not(ancestor::style) and not(ancestor::nav[@class="footer-legal"])]')
        values += [el.get(attr) for el in documents[1].iter() if isinstance(el.tag, str) for attr in builder.ATTRS if el.get(attr)]
        for value in values:
            normal = re.sub(r'\s+', ' ', value).strip()
            if normal in builder.LOOKUP:
                assert builder.LOOKUP[normal] == normal, (en, 'untranslated', normal)
        assert documents[0].xpath('//img/@src') == documents[1].xpath('//img/@src'), en
        assert documents[0].xpath('//option/@value') == documents[1].xpath('//option/@value'), en
        def prices(doc):
            return [re.sub(r'[^0-9]', '', node.text_content()) for node in doc.xpath('//span[@class="price-amount"]')]
        assert prices(documents[0]) == prices(documents[1]), (en, 'price parity')
for name in ['404.html', '404-en.html']:
    doc = html.fromstring((ROOT / name).read_text(encoding='utf-8'))
    base = urljoin('https://example.test/missing/deep/path', doc.xpath('//base/@href')[0])
    for href in doc.xpath('//header//a/@href | //main//a/@href | //link[@rel="stylesheet"]/@href | //script[@src]/@src'):
        if urlsplit(href).scheme or urlsplit(href).netloc:
            continue
        resolved = urlsplit(urljoin(base, href))
        assert resolved.netloc == 'example.test' and (ROOT / resolved.path.lstrip('/')).is_file(), (name, href)
for file in ROOT.glob('*.html'):
    doc = html.fromstring(file.read_text(encoding='utf-8'))
    assert doc.xpath('//link[@rel="icon"]/@href') == ['favicon.ico', 'assets/favicon-32.png'], file.name
    assert doc.xpath('//link[@rel="apple-touch-icon"]/@href') == ['assets/apple-touch-icon.png'], file.name
print('PASS: nine language pairs, translated copy, prices, navigation, nested 404 recovery and favicon links on every page.')
