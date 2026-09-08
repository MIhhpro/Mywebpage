from pathlib import Path
from lxml import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index.html', 'services.html', 'szemelyi-edzes.html', 'online-coaching.html', 'about.html', 'sikerek.html', 'elso-alkalom.html', 'contact.html']
ATTRS = ['alt', 'title', 'aria-label', 'placeholder', 'data-note', 'data-label']
def normal(value):
    return re.sub(r'\s+', ' ', value).strip()
inventory_path = ROOT / 'tools/translation-inventory.json'
# Preserve IDs because the English dictionary refers to them.
entries = json.loads(inventory_path.read_text(encoding='utf-8')) if inventory_path.exists() else []
seen = {entry['hu'] for entry in entries}
initial_count = len(entries)
for name in PAGES:
    doc = html.fromstring((ROOT / name).read_text(encoding='utf-8'))
    for switch in doc.xpath('//nav[@class="language-switch"]'):
        switch.getparent().remove(switch)
    values = doc.xpath('//text()[not(ancestor::script) and not(ancestor::style)]')
    values += [el.get(attr) for el in doc.iter() if isinstance(el.tag, str) for attr in ATTRS if el.get(attr)]
    values += doc.xpath('//meta[@name="description"]/@content')
    for value in values:
        value = normal(value)
        if value and value not in seen and re.search(r'[A-Za-zÀ-ž]', value):
            seen.add(value)
            entries.append({'id': len(entries), 'page': name, 'hu': value})
(ROOT / 'tools/translation-inventory.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(entries) - initial_count} new strings appended; {len(entries)} stable translation IDs.')
