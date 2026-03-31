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
    { title: 'Loft Jordaan', sub: 'Centrum · €1.250/mnd', match: 91, emoji: '🏠', action: 'right' },
    { title: 'Studio De Pijp', sub: 'Zuid · €925/mnd', match: 84, emoji: '🏢', action: 'left' },
    { title: 'Appartement Oost', sub: 'Oost · €1.075/mnd', match: 88, emoji: '🏡', action: 'right' }, // duo match card
  ];

  let currentIndex = 0;
  let running = false;

  function createCard(data) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.innerHTML = `
      <div class="swipe-card-photo">${data.emoji}</div>
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
    for (let i = 0; i < 30; i++) {
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
    currentIndex = 0;
    stack.innerHTML = '';

    // Place all cards in stack (last on top visually)
    const cardEls = cards.map(c => createCard(c));
    cardEls.forEach((el, i) => {
      el.style.zIndex = cards.length - i;
      if (i > 0) el.style.transform = `scale(${1 - i * 0.05}) translateY(${i * 8}px)`;
      stack.appendChild(el);
    });

    function swipeNext() {
      if (currentIndex >= cards.length) {
        // Show duo match
        overlay.classList.add('show');
        spawnConfetti();
        setTimeout(() => {
          overlay.classList.remove('show');
          setTimeout(() => {
            running = false;
            runCycle();
          }, 600);
        }, 2000);
        return;
      }

      const data = cards[currentIndex];
      const cardEl = cardEls[currentIndex];
      const direction = data.action;
      const nopeBtn = document.querySelector('.swipe-nope');
      const likeBtn = document.querySelector('.swipe-like');

      setTimeout(() => {
        // Show stamp
        if (direction === 'left') {
          cardEl.classList.add('show-nope');
          nopeBtn.classList.add('active');
        } else {
          cardEl.classList.add('show-like');
          likeBtn.classList.add('active');
        }

        setTimeout(() => {
          // Swipe away
          cardEl.classList.add(direction === 'left' ? 'swiping-left' : 'swiping-right');
          nopeBtn.classList.remove('active');
          likeBtn.classList.remove('active');

          // Move remaining cards up
          for (let j = currentIndex + 1; j < cardEls.length; j++) {
            const offset = j - currentIndex - 1;
            cardEls[j].style.transform = `scale(${1 - offset * 0.05}) translateY(${offset * 8}px)`;
            cardEls[j].style.transition = 'transform 0.4s ease';
          }

          currentIndex++;
          setTimeout(swipeNext, 800);
        }, 600);
      }, 400);
    }

    setTimeout(swipeNext, 800);
  }

  // Start when visible
  const swipeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !running) runCycle();
    });
  }, { threshold: 0.3 });
  swipeObserver.observe(stack.closest('.swipe-demo'));
})();
