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

  btn.disabled = true;
  btn.textContent = 'Even geduld...';
  msgEl.textContent = '';
  msgEl.className = 'form-msg';

  try {
    const res = await fetch('https://uauoewczlexhbhvxcrjg.supabase.co/functions/v1/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error();
    msgEl.textContent = '🎉 Je staat op de lijst! We houden je op de hoogte.';
    msgEl.className = 'form-msg success';
    input.value = '';
  } catch {
    msgEl.textContent = 'Er ging iets mis. Probeer het later opnieuw.';
    msgEl.className = 'form-msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Schrijf je in';
  }
}

document.getElementById('waitlist-hero').addEventListener('submit', handleWaitlist);
document.getElementById('waitlist-footer').addEventListener('submit', handleWaitlist);
