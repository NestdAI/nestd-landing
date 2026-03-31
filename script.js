// Theme toggle
const toggle = document.getElementById('theme-toggle');
const saved = localStorage.getItem('nestd-theme');
if (saved === 'light') {
  document.body.classList.add('light');
  toggle.textContent = '🌙';
}
toggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  toggle.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('nestd-theme', isLight ? 'light' : 'dark');
});

// Scroll fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in, .fade-in-scale, .fade-in-left, .fade-in-right').forEach(el => observer.observe(el));

// Waitlist form handler
async function handleWaitlist(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input');
  const btn = form.querySelector('button');
  const msgEl = form.nextElementSibling;
  const email = input.value.trim();
  if (!email) return;

  const t = translations[currentLang];
  btn.disabled = true;
  btn.textContent = t.submitLoading;
  msgEl.textContent = '';
  msgEl.className = 'form-msg';

  try {
    const res = await fetch('https://uauoewczlexhbhvxcrjg.supabase.co/functions/v1/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error();
    msgEl.textContent = t.successMsg;
    msgEl.className = 'form-msg success';
    input.value = '';
  } catch {
    msgEl.textContent = t.errorMsg;
    msgEl.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = t.submitBtn;
  }
}

const heroForm = document.getElementById('waitlist-hero');
const footerForm = document.getElementById('waitlist-footer');
if (heroForm) heroForm.addEventListener('submit', handleWaitlist);
if (footerForm) footerForm.addEventListener('submit', handleWaitlist);

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

  // Touch/swipe support
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
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
