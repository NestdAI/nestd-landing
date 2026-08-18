/* ============================================================
   Nestd — Apple-design motion layer
   Springs, 1:1 direct manipulation, velocity handoff, momentum
   projection, rubber-banding. All effects respect reduced motion.
   Kept separate from script.js (analytics/backbone) on purpose.
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const prefersReduced = () => Boolean(reduceMotion?.matches);
  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)');

  // Apple's momentum projection (Designing Fluid Interfaces) — exponential decay,
  // NOT the physics-textbook v²/2a form.
  function project(initialVelocity, decelerationRate = 0.998) {
    return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
  }

  /* ---------- Reveal on scroll (spring-eased) ---------- */
  (function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-scale');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  })();

  /* ---------- Nav: materialize on scroll ---------- */
  (function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let ticking = false;
    function update() {
      nav.classList.toggle('scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ---------- Hero: pointer parallax (spring-eased, desktop only) ---------- */
  (function initHeroParallax() {
    const tilt = document.getElementById('hero-tilt');
    if (!tilt || !canHover?.matches || prefersReduced()) return;
    const layers = tilt.querySelectorAll('.parallax');
    const hero = tilt.closest('.hero');
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function loop() {
      // Ease the presentation value toward the target — interruptible by design.
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      tilt.style.transform = `perspective(1000px) rotateY(${cx * 6}deg) rotateX(${-cy * 6}deg)`;
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth) || 20;
        l.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0)`;
      });
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  })();

  /* ---------- Magnetic buttons ---------- */
  (function initMagnetic() {
    if (!canHover?.matches || prefersReduced()) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        el.style.transform = `translate(${cx}px, ${cy}px)`;
        raf = Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(loop) : null;
        if (!raf) el.style.transform = `translate(${tx}px, ${ty}px)`;
      }
      function kick() { if (!raf) raf = requestAnimationFrame(loop); }
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 14;
        kick();
      });
      el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    });
  })();

  /* ---------- Duo deck: draggable, interruptible gesture demo ----------
     Persistent cards (built once) so the stack promotes with a spring on each
     swipe instead of re-rendering — no jump between cards. Direct manipulation,
     velocity handoff and momentum projection on release. */
  (function initDuoDeck() {
    const deck = document.getElementById('duo-deck');
    const overlay = document.getElementById('duo-match-overlay');
    const confetti = document.getElementById('confetti-container');
    if (!deck) return;

    const nopeBtn = document.querySelector('.duo-nope');
    const likeBtn = document.querySelector('.duo-like');

    const DATA = [
      { title: 'Studio De Pijp', sub: 'Zuid · €925/mnd', match: 84, img: 'images/property-2.jpg', action: 'left' },
      { title: 'Loft Jordaan', sub: 'Centrum · €1.250/mnd', match: 91, img: 'images/property-1.jpg', action: 'right' },
      { title: 'Appartement Oost', sub: 'Oost · €1.075/mnd', match: 88, img: 'images/property-3.jpg', action: 'right' },
    ];
    const THRESHOLD = 90;      // px of travel (or projection) that commits a swipe
    const SPRING = 'transform .55s cubic-bezier(.34,1.4,.5,1)';
    const SETTLE = 'transform .5s cubic-bezier(.22,1,.36,1), opacity .4s ease';

    let cards = [];            // { el, data }
    let top = 0;               // index of the active (front) card
    let inView = false;
    let userEngaged = false;   // true while the user is driving; resumes after idle
    let autoTimer = null;
    let resumeTimer = null;    // hands control back to ambient autoplay after idle
    let busy = false;          // a card is mid fly-off
    const RESUME_IDLE = 4500;  // ms of no interaction before autoplay resumes

    function buildCard(data) {
      const el = document.createElement('div');
      el.className = 'duo-card';
      el.innerHTML =
        `<div class="duo-card-photo"><img src="${data.img}" alt="${data.title}" loading="lazy" draggable="false"></div>` +
        `<div class="duo-card-info"><div class="duo-card-title">${data.title}</div>` +
        `<div class="duo-card-sub">${data.sub}</div>` +
        `<span class="duo-card-match">${data.match}% match</span></div>` +
        `<div class="duo-stamp duo-stamp-like">LEUK</div>` +
        `<div class="duo-stamp duo-stamp-nope">NEE</div>`;
      return el;
    }

    // Position each card by its depth in the stack. depth 0 = front.
    function layout(animate) {
      cards.forEach((c, i) => {
        const depth = i - top;
        if (depth < 0) return;                 // already swiped away — leave it off-screen
        c.el.style.transition = animate ? SPRING : 'none';
        c.el.style.zIndex = String(20 - depth);
        if (depth > 2) {
          c.el.style.opacity = '0';
          c.el.style.transform = 'translateY(40px) scale(.85)';
          c.el.style.pointerEvents = 'none';
        } else {
          c.el.style.opacity = depth === 2 ? '0.55' : '1';
          c.el.style.transform = `translateY(${depth * 12}px) scale(${1 - depth * 0.045})`;
          c.el.style.pointerEvents = depth === 0 ? 'auto' : 'none';
          c.el.style.cursor = depth === 0 ? 'grab' : 'default';
        }
      });
    }

    function build() {
      deck.innerHTML = '';
      cards = DATA.map(d => {
        const el = buildCard(d);
        deck.appendChild(el);
        attachDrag(el);
        return { el, data: d };
      });
      top = 0;
      layout(false);
    }

    function setStamps(el, x) {
      const like = el.querySelector('.duo-stamp-like');
      const nope = el.querySelector('.duo-stamp-nope');
      const t = Math.min(1, Math.abs(x) / THRESHOLD);
      if (x > 0) { like.style.opacity = t; nope.style.opacity = 0; }
      else if (x < 0) { nope.style.opacity = t; like.style.opacity = 0; }
      else { like.style.opacity = 0; nope.style.opacity = 0; }
    }

    // Fly the front card off, then promote the rest with a spring.
    function commit(el, dir, velocity) {
      if (busy) return;
      busy = true;
      const off = (window.innerWidth || 800) * 1.15 * dir;
      el.classList.remove('dragging');
      const dur = prefersReduced() ? 0.2 : Math.max(0.32, Math.min(0.6, 260 / (Math.abs(velocity) + 260)));
      el.style.transition = `transform ${dur}s cubic-bezier(.22,1,.36,1), opacity ${dur}s ease`;
      el.style.transform = `translate(${off}px, -30px) rotate(${dir * 20}deg)`;
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      (dir > 0 ? likeBtn : nopeBtn)?.classList.add('active');
      setTimeout(() => {
        (dir > 0 ? likeBtn : nopeBtn)?.classList.remove('active');
        top++;
        busy = false;
        if (top >= cards.length) showMatch();
        else layout(true);   // remaining cards rise into place
        if (userEngaged) scheduleResume();   // hand back to autoplay after idle
      }, dur * 1000);
    }

    function springBack(el) {
      el.classList.remove('dragging');
      el.style.transition = SPRING;
      el.style.transform = 'translate(0,0) rotate(0)';
      setStamps(el, 0);
    }

    function attachDrag(el) {
      let startX = 0, startY = 0, dragging = false, history = [];

      el.addEventListener('pointerdown', (e) => {
        if (busy || el.style.pointerEvents === 'none') return;
        engage();
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('dragging');
        el.style.transition = 'none';
        startX = e.clientX; startY = e.clientY;
        history = [{ x: e.clientX, t: e.timeStamp }];
      });

      el.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = (e.clientY - startY) * 0.35;   // rubber-band the off-axis
        const rot = (dx / (el.offsetWidth || 300)) * 18;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        setStamps(el, dx);
        history.push({ x: e.clientX, t: e.timeStamp });
        if (history.length > 6) history.shift();
      });

      function release(e) {
        if (!dragging) return;
        dragging = false;
        const dx = e.clientX - startX;
        const first = history[0], last = history[history.length - 1] || first;
        const dt = Math.max(1, last.t - first.t);
        const vx = ((last.x - first.x) / dt) * 1000;       // px/s
        const projected = dx + project(vx);                // momentum projection
        if (Math.abs(projected) > THRESHOLD || Math.abs(vx) > 500) {
          commit(el, projected < 0 || (dx === 0 && vx < 0) ? -1 : 1, vx);
        } else {
          springBack(el);
          scheduleResume();
        }
      }
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
    }

    // Buttons reuse the same commit path on the current front card.
    function frontCard() { return cards[top]?.el || null; }
    nopeBtn?.addEventListener('click', () => { if (busy) return; engage(); const el = frontCard(); if (el) { el.style.transition = 'none'; commit(el, -1, -900); } });
    likeBtn?.addEventListener('click', () => { if (busy) return; engage(); const el = frontCard(); if (el) { el.style.transition = 'none'; commit(el, 1, 900); } });

    function showMatch() {
      if (!overlay) { build(); return; }
      overlay.classList.add('show');
      spawnConfetti();
      setTimeout(() => {
        overlay.classList.remove('show');
        build();                       // fresh stack
        if (!userEngaged) scheduleAuto(1100);
      }, 1900);
    }

    function spawnConfetti() {
      if (!confetti || prefersReduced()) return;
      confetti.innerHTML = '';
      const colors = ['#FF385C', '#FFD700', '#00D4AA', '#7C3AED', '#FF6B35', '#fff'];
      for (let i = 0; i < 36; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.background = colors[i % colors.length];
        p.style.setProperty('--x', (((i * 53) % 100) / 100 - 0.5) * 300 + 'px');
        p.style.setProperty('--y', (((i * 31) % 100) / 100 - 0.5) * 300 + 'px');
        p.style.setProperty('--r', ((i * 47) % 720) + 'deg');
        p.style.animationDelay = ((i % 6) * 0.05) + 's';
        confetti.appendChild(p);
      }
    }

    // Ambient auto-play — plays each card's scripted choice until the user takes over.
    function autoStep() {
      if (busy || userEngaged || !inView) return;
      const el = frontCard();
      if (!el) return;
      const dir = cards[top].data.action === 'left' ? -1 : 1;
      el.style.transition = 'none';
      commit(el, dir, dir * 650);
      scheduleAuto(1600);
    }
    function scheduleAuto(delay) {
      if (userEngaged || prefersReduced()) return;
      stopAuto();
      autoTimer = setTimeout(autoStep, delay);
    }
    function stopAuto() { clearTimeout(autoTimer); autoTimer = null; }

    // The user takes over on any interaction; ambient autoplay pauses...
    function engage() {
      userEngaged = true;
      stopAuto();
      clearTimeout(resumeTimer);
    }
    // ...then resumes after a spell of inactivity, so the demo never dies.
    function scheduleResume() {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        userEngaged = false;
        if (inView) scheduleAuto(500);
      }, RESUME_IDLE);
    }

    build();

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        inView = e.isIntersecting;
        if (inView) scheduleAuto(1300);
        else stopAuto();
      });
    }, { threshold: 0.4 });
    io.observe(deck.closest('.duo-demo') || deck);
  })();
})();
