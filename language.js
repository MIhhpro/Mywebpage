// Keep the corresponding section and package when changing language.
// Only service choices travel in the URL; form names and emails do not.
(() => {
  const links = document.querySelectorAll('.language-switch a[data-language]');
  const update = () => {
    const current = new URL(window.location.href);
    links.forEach(link => {
      const target = new URL(link.getAttribute('href'), document.baseURI || current);
      target.search = '';
      for (const key of ['service', 'package']) {
        if (current.searchParams.has(key)) target.searchParams.set(key, current.searchParams.get(key));
      }
      target.hash = current.hash;
      link.setAttribute('href', target.pathname + target.search + target.hash);
    });
  };
  update();
  window.addEventListener('hashchange', update);
  let navigating = false;
  links.forEach(link => {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const control = link.closest('.language-switch');
      const next = link.dataset.language;
      if (!control || next === document.documentElement.lang) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      if (navigating) return;
      navigating = true;
      control.dataset.selected = next;
      window.setTimeout(() => { window.location.assign(link.href); }, 240);
    });
  });
  window.addEventListener('pageshow', () => {
    navigating = false;
    links.forEach(link => {
      const control = link.closest('.language-switch');
      if (control) control.dataset.selected = document.documentElement.lang;
    });
    update();
  });
})();
