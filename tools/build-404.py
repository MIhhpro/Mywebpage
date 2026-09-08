"""Build matching HU/EN error pages for the existing custom-domain GitHub site."""
from pathlib import Path
import importlib.util
import re

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('languages', ROOT / 'tools/build-languages.py')
languages = importlib.util.module_from_spec(spec)
spec.loader.exec_module(languages)
for lang, template, target in [('hu', 'services.html', '404.html'), ('en', 'services-en.html', '404-en.html')]:
    en = lang == 'en'
    source = languages.strip_language_ui((ROOT / template).read_text(encoding='utf-8'))
    title = 'Page not found' if en else 'Az oldal nem található'
    desc = 'This link may have changed, or the address may contain a typo.' if en else 'Lehet, hogy megváltozott a hivatkozás, vagy elírás került a címbe.'
    source = re.sub(r'<title>.*?</title>', f'<title>{title} | Mihály Bence</title>', source)
    source = re.sub(r'<meta name="description"[^>]*>', f'<meta name="description" content="{desc}">', source)
    # A missing /nested/path still needs the site's root assets and recovery links.
    # The owner uses a custom domain. For /repository/ hosting, change this base.
    source = source.replace('<head>', '<head>\n<base href="/">\n<meta name="robots" content="noindex">')
    source = source.replace('<body>', '<body class="error-page">')
    source = re.sub(r' aria-current="page"', '', source)
    source = re.sub(r'<main.*?</main>', f'''<main id="main-content" tabindex="-1">
<section class="error-content" aria-labelledby="error-title">
<p class="error-code" aria-label="{'Error 404' if en else '404-es hiba'}">404</p>
<h1 id="error-title">{title}.</h1><p class="error-description">{desc}</p>
<p>{'Let’s get you back to your next step.' if en else 'Találjuk meg a következő lépésed.'}</p>
<div class="error-actions"><a class="btn btn-primary" href="{'index-en.html' if en else 'index.html'}">{'Back to the homepage' if en else 'Vissza a főoldalra'}</a>
<a class="btn btn-outline" href="{'services-en.html' if en else 'services.html'}">{'Explore services' if en else 'Megnézem a szolgáltatásokat'}</a></div>
<a class="error-contact" href="{'contact-en.html' if en else 'contact.html'}">{'Need a hand? Get in touch →' if en else 'Segíthetek? Írj nekem →'}</a>
</section></main>''', source, flags=re.S)
    source = source.replace('</head>', '<link rel="stylesheet" href="error.css?v=15.4">\n</head>')
    source = re.sub(r'<script src="section-nav\.js"[^>]*></script>', '', source)
    (ROOT / target).write_text(languages.decorate(source, '404.html', '404-en.html', lang), encoding='utf-8')
print('Built Hungarian and English 404 pages with root-safe recovery links.')
