// Analytics — PostHog is the source of truth; Meta Pixel is for ads optimization only.
(function initMarketingAnalytics() {
  const POSTHOG_KEY = window.NESTD_POSTHOG_KEY || document.querySelector('meta[name="posthog-key"]')?.content || '';
  const POSTHOG_HOST = 'https://eu.i.posthog.com';
  const META_PIXEL_ID = window.NESTD_META_PIXEL_ID || document.querySelector('meta[name="facebook-pixel-id"]')?.content || '1435983921187208';
  const META_STANDARD_EVENTS = new Set([
    'AddPaymentInfo',
    'AddToCart',
    'AddToWishlist',
    'CompleteRegistration',
    'Contact',
    'CustomizeProduct',
    'Donate',
    'FindLocation',
    'InitiateCheckout',
    'Lead',
    'PageView',
    'Purchase',
    'Schedule',
    'Search',
    'StartTrial',
    'SubmitApplication',
    'Subscribe',
    'ViewContent',
  ]);
  const POSTHOG_QUEUE = [];
  let posthogReady = false;

  // Meta Pixel may implicitly receive page URL/referrer from the browser.
  // Keep it limited to safe public marketing/deeplink contexts and never load
  // it on listing/product routes or when unknown query params/referrers could
  // leak raw listing identifiers or sensitive preferences.
  const META_SAFE_QUERY_KEYS = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'fbclid',
  ]);

  function isListingPath(pathname = '') {
    return /^\/listing(?:\/|$)/.test(pathname);
  }

  function isMetaPixelAllowedPath(pathname = window.location.pathname) {
    const normalizedPath = pathname.replace(/\/index\.html$/, '/');
    if (isListingPath(normalizedPath)) return false;
    if (normalizedPath === '/' || normalizedPath === '/index.html') return true;
    if (normalizedPath === '/about.html' || normalizedPath === '/pricing.html' || normalizedPath === '/privacy.html') return true;
    if (normalizedPath === '/app' || normalizedPath === '/app/' || normalizedPath === '/app/index.html') return true;
    return false;
  }

  function hasOnlyMetaSafeQueryParams(search = window.location.search) {
    const params = new URLSearchParams(search);
    for (const key of params.keys()) {
      if (!META_SAFE_QUERY_KEYS.has(key)) return false;
    }
    return true;
  }

  function hasSensitiveReferrer(referrer = document.referrer) {
    if (!referrer) return false;
    try {
      const parsed = new URL(referrer, window.location.origin);
      return parsed.origin === window.location.origin && isListingPath(parsed.pathname);
    } catch {
      return true;
    }
  }

  function isMetaPixelAllowedContext() {
    return isMetaPixelAllowedPath() && hasOnlyMetaSafeQueryParams() && !hasSensitiveReferrer();
  }

  function safeUrl(value) {
    if (!value) return null;
    try {
      const parsed = new URL(value, window.location.origin);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return null;
    }
  }

  function getAttributionPayload(properties = {}) {
    const params = new URLSearchParams(window.location.search);
    return {
      path: window.location.pathname,
      url: safeUrl(window.location.href),
      referrer: safeUrl(document.referrer),
      language: document.documentElement.lang || localStorage.getItem('nestd-lang') || 'nl',
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
      ...properties,
    };
  }

  function sanitizeMetaProperties(properties = {}) {
    const allowedKeys = new Set(['content_name', 'content_category', 'placement', 'store']);
    return Object.entries(properties).reduce((safe, [key, value]) => {
      if (allowedKeys.has(key) && value !== undefined && value !== null && value !== '') safe[key] = value;
      return safe;
    }, {});
  }

  function loadMetaPixel() {
    if (!META_PIXEL_ID || window.fbq || !isMetaPixelAllowedContext()) return;

    !function(f,b,e,v,n,t,s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function trackMeta(event, properties = {}) {
    if (!META_PIXEL_ID || !window.fbq || !isMetaPixelAllowedContext()) return;
    const method = META_STANDARD_EVENTS.has(event) ? 'track' : 'trackCustom';
    const payload = sanitizeMetaProperties(properties);
    if (Object.keys(payload).length > 0) window.fbq(method, event, payload);
    else window.fbq(method, event);
  }

  window.nestdAnalytics = {
    track(event, properties = {}) {
      const payload = getAttributionPayload(properties);
      if (posthogReady && window.posthog?.capture) {
        window.posthog.capture(event, payload);
        return;
      }
      if (POSTHOG_KEY) POSTHOG_QUEUE.push([event, payload]);
    },
    trackMeta,
  };

  loadMetaPixel();

  if (!POSTHOG_KEY) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://eu-assets.i.posthog.com/static/array.js';
  script.onload = function () {
    window.posthog?.init?.(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: '2026-01-30',
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: true,
      person_profiles: 'identified_only',
    });
    posthogReady = true;
    window.nestdAnalytics.track('page_view');
    while (POSTHOG_QUEUE.length) {
      const [event, payload] = POSTHOG_QUEUE.shift();
      window.posthog?.capture?.(event, payload);
    }
  };
  document.head.appendChild(script);
})();

// Theme toggle with prefers-color-scheme support
const toggle = document.getElementById('theme-toggle');
const saved = localStorage.getItem('nestd-theme');

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light', isLight);
  if (toggle) toggle.textContent = isLight ? '🌙' : '☀️';
}

// Initial theme is set by blocking <script> in <body> to prevent FOUC.
// Only sync the toggle icon here.
if (saved) {
  if (toggle) toggle.textContent = saved === 'light' ? '🌙' : '☀️';
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  if (toggle) toggle.textContent = '🌙';
}

// Listen for system theme changes (only if user hasn't set a preference)
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('nestd-theme')) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });
}

if (toggle) {
  toggle.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light');
    const theme = isLight ? 'light' : 'dark';
    applyTheme(theme);
    localStorage.setItem('nestd-theme', theme);
    window.nestdAnalytics?.track('theme_toggled', { theme });
  });
}

// Scroll fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in, .fade-in-scale, .fade-in-left, .fade-in-right').forEach(el => {
  // Don't observe step-items — they use their own scroll-driven visibility system
  if (el.classList.contains('step-item')) return;
  observer.observe(el);
});

// WhatsApp looping notification animation
const waMock = document.querySelector('.wa-mock');
if (waMock) {
  let waLoopTimer = null;

  function waAnimationLoop() {
    const els = waMock.querySelectorAll('.wa-animate');
    // Phase 1: fade in (staggered via CSS delays)
    els.forEach(el => el.classList.add('wa-visible'));
    waLoopTimer = setTimeout(() => {
      // Phase 2: fade out all together
      els.forEach(el => el.classList.add('wa-fade-out'));
      waLoopTimer = setTimeout(() => {
        // Phase 3: reset
        els.forEach(el => { el.classList.remove('wa-visible', 'wa-fade-out'); });
        waLoopTimer = setTimeout(waAnimationLoop, 500);
      }, 800);
    }, 4500);
  }

  function waStopLoop() {
    clearTimeout(waLoopTimer);
    waLoopTimer = null;
    waMock.querySelectorAll('.wa-animate').forEach(el => {
      el.classList.remove('wa-visible', 'wa-fade-out');
    });
  }

  const waObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { if (!waLoopTimer) waAnimationLoop(); }
      else { waStopLoop(); }
    });
  }, { threshold: 0.3 });
  waObserver.observe(waMock);
}

// Scroll-driven "How it works" steps with animations
(function initStepsScroll() {
  const stepItems = document.querySelectorAll('.step-item[data-step-index]');
  const stepAnims = document.querySelectorAll('.step-anim[data-step]');
  if (!stepItems.length || !stepAnims.length) return;

  let currentStep = -1;
  let animTimers = [];

  function clearAnimTimers() {
    animTimers.forEach(t => clearTimeout(t));
    animTimers = [];
  }

  function resetAnimElements(animEl) {
    animEl.querySelectorAll('.anim-visible').forEach(el => el.classList.remove('anim-visible'));
    animEl.querySelectorAll('.anim-checked').forEach(el => el.classList.remove('anim-checked'));
    animEl.querySelectorAll('.typing-text').forEach(el => el.textContent = '');
  }

  function typeText(el, text, cb) {
    let i = 0;
    function next() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        const timer = setTimeout(next, 35 + Math.random() * 25);
        animTimers.push(timer);
      } else if (cb) cb();
    }
    next();
  }

  function animateStep(idx) {
    clearAnimTimers();
    const animEl = document.querySelector(`.step-anim[data-step="${idx}"]`);
    if (!animEl) return;
    resetAnimElements(animEl);

    if (idx === 0) {
      // Profile creation: sequential field typing
      const fields = animEl.querySelectorAll('.anim-field');
      const btn = animEl.querySelector('.anim-profile-btn');
      let fieldIdx = 0;
      function animField() {
        if (fieldIdx >= fields.length) {
          if (btn) { const t = setTimeout(() => btn.classList.add('anim-visible'), 200); animTimers.push(t); }
          return;
        }
        const f = fields[fieldIdx];
        const t1 = setTimeout(() => {
          f.classList.add('anim-visible');
          const typingEl = f.querySelector('.typing-text');
          const text = typingEl?.dataset.text || '';
          const t2 = setTimeout(() => {
            typeText(typingEl, text, () => {
              const t3 = setTimeout(() => {
                f.classList.add('anim-checked');
                fieldIdx++;
                const t4 = setTimeout(animField, 200);
                animTimers.push(t4);
              }, 300);
              animTimers.push(t3);
            });
          }, 200);
          animTimers.push(t2);
        }, fieldIdx === 0 ? 300 : 100);
        animTimers.push(t1);
      }
      animField();
    } else {
      // Cards/bubbles: staggered entrance
      const items = animEl.querySelectorAll('[data-delay]');
      items.forEach(item => {
        const delay = parseInt(item.dataset.delay) || 0;
        const t = setTimeout(() => item.classList.add('anim-visible'), 300 + delay * 350);
        animTimers.push(t);
      });
    }
  }

  function activateStep(idx) {
    if (idx === currentStep) return;
    const prevStep = currentStep;
    currentStep = idx;

    // Sequential fade: old step fades out FIRST, then new step fades in
    const fadeOutDuration = 350; // ms — matches CSS transition

    // Fade out old step
    if (prevStep >= 0) {
      stepItems[prevStep]?.classList.remove('step-active');
      const oldAnim = document.querySelector(`.step-anim[data-step="${prevStep}"]`);
      if (oldAnim) oldAnim.classList.remove('active');
    }

    // After old step has fully faded out, fade in new step
    const delay = prevStep >= 0 ? fadeOutDuration : 0;
    setTimeout(() => {
      // Reset all anims (cleanup)
      stepAnims.forEach(a => { resetAnimElements(a); });

      stepItems[idx]?.classList.add('step-active');
      const animEl = document.querySelector(`.step-anim[data-step="${idx}"]`);
      if (animEl) {
        animEl.classList.add('active');
        animateStep(idx);
      }
    }, delay);
  }

  // Activate first step
  activateStep(0);

  const isMobile = () => window.innerWidth <= 768;

  // Mobile: scroll-position based fade transitions
  function handleMobileScroll() {
    const textCol = document.querySelector('.steps-text-col');
    if (!textCol) return;
    const rect = textCol.getBoundingClientRect();
    const scrollHeight = textCol.offsetHeight;
    const scrolled = -rect.top; // how far we've scrolled into the section
    const maxScroll = scrollHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrolled / maxScroll));

    // Exact 4 equal parts — each step gets 25% of scroll distance
    let idx = Math.min(3, Math.floor(progress * 4));
    activateStep(idx);
  }

  // Desktop: IntersectionObserver
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = parseInt(e.target.dataset.stepIndex);
        activateStep(idx);
      }
    });
  }, { threshold: 0.15, rootMargin: '-35% 0px -35% 0px' });

  function setupObservers() {
    if (isMobile()) {
      // Disconnect IO, use scroll
      stepObserver.disconnect();
      window.addEventListener('scroll', handleMobileScroll, { passive: true });
      handleMobileScroll();
    } else {
      window.removeEventListener('scroll', handleMobileScroll);
      stepItems.forEach(item => stepObserver.observe(item));
    }
  }

  setupObservers();
  window.addEventListener('resize', setupObservers);
})();

// Track marketing CTA and navigation clicks
(function initMarketingClickTracking() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a, button');
    if (!link) return;

    if (link.matches('.badge-link') || link.querySelector?.('.app-badge')) {
      const href = link.getAttribute('href') || '';
      const store = href.includes('apps.apple.com') ? 'app_store' : 'google_play';
      const placement = link.closest('.hero') ? 'hero' : link.closest('.cta-badges-section') ? 'mid_page' : 'other';
      window.nestdAnalytics?.track('store_badge_clicked', {
        store,
        label: link.textContent?.trim() || link.querySelector?.('img')?.getAttribute('alt') || null,
        href: href ? href.split('?')[0] : null,
        placement,
      });
      window.nestdAnalytics?.trackMeta('ViewContent', {
        content_name: 'app_download_cta',
        content_category: 'app_download',
        placement,
        store,
      });
      return;
    }

    if (link.matches('.navbar a, .navbar-mobile a, .page-footer a')) {
      window.nestdAnalytics?.track('navigation_clicked', {
        label: link.textContent?.trim() || null,
        href: link.getAttribute('href') || null,
        location: link.closest('.page-footer') ? 'footer' : link.closest('.navbar-mobile') ? 'mobile_nav' : 'nav',
      });
    }
  });
})();

// Track important section views once per page load
(function initSectionViewTracking() {
  const sections = [
    ['#whatsapp', 'whatsapp_alerts_section_viewed'],
    ['#matching', 'ai_matching_section_viewed'],
    ['.duo-section', 'duo_search_section_viewed'],
    ['.how-it-works', 'how_it_works_section_viewed'],
    ['.pricing-section', 'pricing_section_viewed'],
  ];

  const sectionObserver = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const eventName = entry.target.dataset.analyticsEvent;
      if (eventName) {
        window.nestdAnalytics?.track(eventName);
        window.nestdAnalytics?.trackMeta('ViewContent', {
          content_name: eventName.replace('_section_viewed', ''),
          content_category: 'landing_section',
        });
      }
      observerInstance.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  sections.forEach(([selector, eventName]) => {
    document.querySelectorAll(selector).forEach(el => {
      el.dataset.analyticsEvent = eventName;
      sectionObserver.observe(el);
    });
  });
})();

// Waitlist forms removed — app is live

// ═══════════════════════════════════════
// Swipe Animation (Duo Zoeken)
// ═══════════════════════════════════════
(function initSwipeDemo() {
  const stack = document.getElementById('swipe-stack');
  const overlay = document.getElementById('duo-match-overlay');
  const confettiEl = document.getElementById('confetti-container');
  if (!stack) return;

  const cards = [
    { title: 'Studio De Pijp', sub: 'Zuid · €925/mnd', match: 84, img: 'images/property-2.jpg', action: 'left' },
    { title: 'Loft Jordaan', sub: 'Centrum · €1.250/mnd', match: 91, img: 'images/property-1.jpg', action: 'right' },
    { title: 'Appartement Oost', sub: 'Oost · €1.075/mnd', match: 88, img: 'images/property-3.jpg', action: 'right' },
  ];

  let cycleTimer = null;
  let running = false;

  function createCard(data) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.innerHTML = `
      <div class="swipe-card-photo"><img src="${data.img}" alt="${data.title}" /></div>
      <div class="swipe-card-info">
        <div class="swipe-card-title">${data.title}</div>
        <div class="swipe-card-sub">${data.sub}</div>
        <span class="swipe-card-match">${data.match}% match</span>
      </div>
      <div class="swipe-stamp swipe-stamp-nope">❌</div>
      <div class="swipe-stamp swipe-stamp-like">✅</div>
    `;
    return card;
  }

  function spawnConfetti() {
    confettiEl.innerHTML = '';
    const colors = ['#FF385C', '#FFD700', '#00D4AA', '#7C3AED', '#FF6B35', '#fff'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--x', (Math.random() - 0.5) * 300 + 'px');
      piece.style.setProperty('--y', (Math.random() - 0.5) * 300 + 'px');
      piece.style.setProperty('--r', Math.random() * 720 + 'deg');
      piece.style.animationDelay = Math.random() * 0.3 + 's';
      confettiEl.appendChild(piece);
    }
  }

  function runCycle() {
    if (running) return;
    running = true;
    let currentIndex = 0;
    stack.innerHTML = '';
    overlay.classList.remove('show');

    const cardEls = cards.map(c => createCard(c));
    cardEls.forEach(el => stack.appendChild(el));

    const nopeBtn = stack.closest('.swipe-phone').querySelector('.swipe-nope');
    const likeBtn = stack.closest('.swipe-phone').querySelector('.swipe-like');

    function showCard(index) {
      if (index >= cards.length) {
        // Show duo match overlay
        overlay.classList.add('show');
        spawnConfetti();
        setTimeout(() => {
          overlay.classList.remove('show');
          running = false;
          cycleTimer = setTimeout(runCycle, 800);
        }, 2000);
        return;
      }

      const cardEl = cardEls[index];
      const direction = cards[index].action;

      // Reset card state for entrance
      cardEl.classList.remove('swiping-left', 'swiping-right', 'show-nope', 'show-like');
      cardEl.removeAttribute('style');
      cardEl.classList.add('active', 'entering');

      // Animate in via CSS class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cardEl.classList.remove('entering');
        });
      });

      // After 1 sec: show stamp then swipe off
      setTimeout(() => {
        if (direction === 'left') {
          cardEl.classList.add('show-nope');
          nopeBtn.classList.add('active');
        } else {
          cardEl.classList.add('show-like');
          likeBtn.classList.add('active');
        }

        // Fly off after stamp shows
        setTimeout(() => {
          cardEl.classList.add(direction === 'left' ? 'swiping-left' : 'swiping-right');
          nopeBtn.classList.remove('active');
          likeBtn.classList.remove('active');

          // After card flies off, hide it and show next
          setTimeout(() => {
            cardEl.classList.remove('active');
            currentIndex++;
            showCard(currentIndex);
          }, 450);
        }, 400);
      }, 1000);
    }

    showCard(0);
  }

  // Start when visible, pause when not
  const swipeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !running) {
        runCycle();
      } else if (!e.isIntersecting) {
        clearTimeout(cycleTimer);
        running = false;
      }
    });
  }, { threshold: 0.3 });
  swipeObserver.observe(stack.closest('.swipe-demo'));
})();

// ═══════════════════════════════════════
// Testimonial Carousel
// ═══════════════════════════════════════
(function initTestimonialCarousel() {
  const track = document.querySelector('.testimonial-track');
  if (!track) return;

  const slides = Array.from(track.children);
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  const dotsContainer = document.querySelector('.testimonial-dots');
  let current = 0;
  let autoTimer = null;
  let startX = 0;
  let isDragging = false;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.testimonial-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Move arrows into nav-row on mobile
  const navRow = document.querySelector('.testimonial-nav-row');
  function arrangeNav() {
    if (!navRow || !prevBtn || !nextBtn) return;
    if (window.innerWidth <= 768) {
      navRow.insertBefore(prevBtn, navRow.firstChild);
      navRow.appendChild(nextBtn);
    } else {
      // Move arrows back to carousel root (before/after viewport)
      const viewport = track.closest('.testimonial-viewport');
      const carousel = viewport.parentElement;
      carousel.insertBefore(prevBtn, viewport);
      viewport.after(nextBtn);
    }
  }
  arrangeNav();
  window.addEventListener('resize', arrangeNav);

  // Touch/swipe support
  let currentX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
    track.style.transition = 'none';
    clearInterval(autoTimer);
  }, { passive: true });
  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    // Prevent vertical scroll when swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
    const offset = -(current * 100) - (diff / track.offsetWidth * 100);
    track.style.transform = `translateX(${offset}%)`;
  }, { passive: false });
  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    } else {
      goTo(current); // snap back
    }
    resetAuto();
  });

  // Auto-advance
  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5000);
  }
  resetAuto();

  // Pause on hover
  const section = track.closest('.testimonials-section');
  section.addEventListener('mouseenter', () => clearInterval(autoTimer));
  section.addEventListener('mouseleave', resetAuto);
})();

// Hide navbar when scrolling through "Hoe het werkt" section on mobile
(function() {
  const howSection = document.querySelector('.how-it-works');
  const navbar = document.querySelector('.navbar');
  if (!howSection || !navbar) return;

  const mq = window.matchMedia('(max-width: 900px)');

  const obs = new IntersectionObserver((entries) => {
    if (!mq.matches) { navbar.classList.remove('navbar-hidden'); return; }
    entries.forEach(e => {
      navbar.classList.toggle('navbar-hidden', e.isIntersecting);
    });
  }, { threshold: 0.1 });

  obs.observe(howSection);
})();
