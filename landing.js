// Complete Dutch HTML remains usable when JavaScript or browser storage is unavailable.
(function initLanding() {
  document.documentElement.classList?.add?.('js');
  const validLanguage = value => value === 'nl' || value === 'en';
  let storedLanguage;
  try { storedLanguage = window.localStorage.getItem('nestd-lang'); } catch { /* Optional preference. */ }
  const queryLanguage = (new URLSearchParams(window.location.search).get('lang') || '').toLowerCase();
  let language = validLanguage(queryLanguage) ? queryLanguage
    : /^\/en(?:\/|$)/.test(window.location.pathname) ? 'en'
      : validLanguage(storedLanguage) ? storedLanguage : 'nl';
  const languageToggle = document.getElementById('lang-toggle');

  function applyLanguage() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-nl][data-en]').forEach(element => {
      const text = element.getAttribute(`data-${language}`);
      if (element.tagName === 'META') element.setAttribute('content', text);
      else element.textContent = text;
    });
    for (const [attribute, dataName] of [['alt', 'alt'], ['aria-label', 'aria']]) {
      document.querySelectorAll(`[data-${dataName}-nl][data-${dataName}-en]`).forEach(element => {
        element.setAttribute(attribute, element.getAttribute(`data-${dataName}-${language}`));
      });
    }
    if (languageToggle) {
      const target = new URL(window.location.href);
      target.searchParams.set('lang', language === 'nl' ? 'en' : 'nl');
      languageToggle.setAttribute('href', `${target.pathname}${target.search}${target.hash}`);
      languageToggle.textContent = language === 'nl' ? 'EN' : 'NL';
      languageToggle.setAttribute('aria-label', language === 'nl' ? 'Switch to English' : 'Wissel naar Nederlands');
      languageToggle.setAttribute('lang', language === 'nl' ? 'en' : 'nl');
    }
    try { window.localStorage.setItem('nestd-lang', language); } catch { /* Navigation still preserves language. */ }
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link === languageToggle) return;
      try {
        const destination = new URL(href, window.location.href);
        if (destination.origin !== window.location.origin || !/^https?:$/.test(destination.protocol)) return;
        const basePath = destination.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
        if (['/', '/index.html', '/about.html', '/pricing.html', '/privacy.html'].includes(basePath)) {
          destination.pathname = language === 'en'
            ? (basePath === '/' || basePath === '/index.html' ? '/en/' : '/en' + basePath)
            : basePath;
        }
        destination.searchParams.set('lang', language);
        link.setAttribute('href', `${destination.pathname}${destination.search}${destination.hash}`);
      } catch { /* Leave non-URL links alone. */ }
    });
  }

  applyLanguage();
  languageToggle?.addEventListener('click', event => {
    event.preventDefault?.();
    language = language === 'nl' ? 'en' : 'nl';
    applyLanguage();
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    try { window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`); } catch { /* Translation still works. */ }
  });

  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (menuToggle && menu) {
    menuToggle.hidden = false;
    function closeMenu(returnFocus = false) {
      menu.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) menuToggle.focus();
    }
    menuToggle.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (menu.hidden || menuToggle.contains(event.target)) return;
      if (!menu.contains(event.target) || event.target.closest?.('a')) closeMenu();
    });
    window.matchMedia?.('(min-width: 851px)').addEventListener?.('change', event => {
      if (event.matches) closeMenu();
    });
  }

  const sticky = document.querySelector('[data-sticky-cta]');
  const heroAction = document.querySelector('[data-cta-placement="hero"]');
  const finalAction = document.querySelector('[data-cta-placement="bottom"]');
  if (sticky && heroAction && finalAction) {
    let queued = false;
    function updateSticky() {
      queued = false;
      const narrow = window.matchMedia?.('(max-width: 767px)').matches;
      const heroPassed = heroAction.getBoundingClientRect().bottom < 0;
      const finalNear = finalAction.getBoundingClientRect().top < window.innerHeight + 96;
      sticky.hidden = !narrow || !heroPassed || finalNear;
    }
    function scheduleUpdate() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(updateSticky);
    }
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    updateSticky();
  }
})();
