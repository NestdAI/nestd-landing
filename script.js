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
    applyTheme(isLight ? 'light' : 'dark');
    localStorage.setItem('nestd-theme', isLight ? 'light' : 'dark');
  });
}

// Scroll fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in, .fade-in-scale, .fade-in-left, .fade-in-right').forEach(el => observer.observe(el));

// WhatsApp staggered entrance on scroll
const waMock = document.querySelector('.wa-mock');
if (waMock) {
  const waObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        waMock.querySelectorAll('.wa-animate').forEach(el => el.classList.add('wa-visible'));
        waObserver.unobserve(e.target);
      }
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
    currentStep = idx;

    stepItems.forEach(s => s.classList.remove('step-active'));
    stepItems[idx]?.classList.add('step-active');

    stepAnims.forEach(a => { a.classList.remove('active'); resetAnimElements(a); });
    const animEl = document.querySelector(`.step-anim[data-step="${idx}"]`);
    if (animEl) {
      animEl.classList.add('active');
      animateStep(idx);
    }
  }

  // Activate first step
  activateStep(0);

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = parseInt(e.target.dataset.stepIndex);
        activateStep(idx);
      }
    });
  }, { threshold: 0.15, rootMargin: '-35% 0px -35% 0px' });

  stepItems.forEach(item => stepObserver.observe(item));
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
  }, { passive: true });
  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    const offset = -(current * 100) - (diff / track.offsetWidth * 100);
    track.style.transform = `translateX(${offset}%)`;
  }, { passive: true });
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
