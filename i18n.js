const translations = {
  nl: {
    cta: 'Early Access →',
    heroTitle: 'Vind je droomhuurwoning.<br><em>Laat AI de rest doen.</em>',
    heroSub: 'Nestd is je persoonlijke AI-assistent voor huurwoningen. Vindt huurwoningen, reageert automatisch, en stuurt matches via WhatsApp.',
    emailPlaceholder: 'je@email.nl',
    submitBtn: 'Schrijf je in',
    submitLoading: 'Even geduld...',
    successMsg: '🎉 Je staat op de lijst! We houden je op de hoogte.',
    errorMsg: 'Er ging iets mis. Probeer het later opnieuw.',
    featuresLabel: 'Wat Nestd voor je doet',
    f1Title: 'Slimmer zoeken',
    f1Desc: 'AI leert je voorkeuren en matcht huurwoningen die écht bij je passen. Niet 100 irrelevante hits, maar de 5 die er toe doen.',
    f2Title: 'Automatisch reageren',
    f2Desc: 'Geen eindeloos formulieren invullen. Nestd reageert automatisch met jouw documenten en een gepersonaliseerde motivatiebrief.',
    f3Title: 'WhatsApp alerts',
    f3Desc: 'Nieuwe match? Direct een bericht op WhatsApp. Geen app openen, geen email checken. Het komt naar jou.',
    f4Title: 'AI Woonassistent',
    f4Desc: 'Chat met je persoonlijke assistent. Stel vragen, pas voorkeuren aan, krijg advies. 24/7 beschikbaar.',
    howLabel: 'Hoe het werkt',
    howTitle: 'Vier stappen naar<br><em>je nieuwe thuis.</em>',
    s1Title: 'Maak een profiel aan',
    s1Desc: 'Via onze AI-chat. Vertel wat je zoekt — budget, locatie, wensen. In een paar minuten klaar.',
    s2Title: 'AI matcht huurwoningen',
    s2Desc: 'Op basis van jouw wensen. Geen eindeloos scrollen — alleen huurwoningen die er toe doen.',
    s3Title: 'Kies je favorieten',
    s3Desc: 'Wij reageren automatisch met jouw documenten en een gepersonaliseerde motivatiebrief.',
    s4Title: 'Ontvang updates',
    s4Desc: 'Via WhatsApp. Nieuwe matches, statusupdates, alles direct op je telefoon.',
    waitlistTitle: '<em>Nestd is in ontwikkeling.</em>',
    waitlistSub: 'Schrijf je in voor early access.',
    waitlistNote: 'Geen spam. Alleen een bericht wanneer we live gaan.',
  },
  en: {
    cta: 'Early Access →',
    heroTitle: 'Find your dream rental.<br><em>Let AI do the rest.</em>',
    heroSub: 'Nestd is your personal AI housing assistant. Finds rentals, applies automatically, and sends matches via WhatsApp.',
    emailPlaceholder: 'you@email.com',
    submitBtn: 'Join the waitlist',
    submitLoading: 'Please wait...',
    successMsg: "🎉 You're on the list! We'll keep you posted.",
    errorMsg: 'Something went wrong. Please try again later.',
    featuresLabel: 'What Nestd does for you',
    f1Title: 'Smarter search',
    f1Desc: "AI learns your preferences and matches rentals that truly fit. Not 100 irrelevant hits — just the 5 that matter.",
    f2Title: 'Auto-apply',
    f2Desc: 'No more endless form filling. Nestd applies automatically with your documents and a personalised cover letter.',
    f3Title: 'WhatsApp alerts',
    f3Desc: "New match? Instant WhatsApp message. No app to open, no email to check. It comes to you.",
    f4Title: 'AI Housing Assistant',
    f4Desc: 'Chat with your personal assistant. Ask questions, adjust preferences, get advice. Available 24/7.',
    howLabel: 'How it works',
    howTitle: 'Four steps to<br><em>your new home.</em>',
    s1Title: 'Create a profile',
    s1Desc: 'Through our AI chat. Tell us what you need — budget, location, preferences. Done in minutes.',
    s2Title: 'AI matches rentals',
    s2Desc: "Based on your preferences. No endless scrolling — only rentals that matter.",
    s3Title: 'Pick your favourites',
    s3Desc: 'We apply automatically with your documents and a personalised cover letter.',
    s4Title: 'Get updates',
    s4Desc: 'Via WhatsApp. New matches, status updates, everything straight to your phone.',
    waitlistTitle: '<em>Nestd is under development.</em>',
    waitlistSub: 'Sign up for early access.',
    waitlistNote: 'No spam. Just a message when we go live.',
  },
};

let currentLang = localStorage.getItem('nestd-lang') || 'nl';

function applyLang(lang) {
  currentLang = lang;
  const t = translations[lang];
  document.documentElement.lang = lang;

  // Update page title
  document.title = lang === 'nl' ? 'Nestd — Jouw AI Woonassistent' : 'Nestd — Your AI Housing Assistant';

  // Text content
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  // Inner HTML (for elements with <em>, <br>)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key]) el.innerHTML = t[key];
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });

  // Update lang toggle button
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = lang === 'nl' ? '🇬🇧' : '🇳🇱';

  localStorage.setItem('nestd-lang', lang);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);

  document.getElementById('lang-toggle').addEventListener('click', () => {
    applyLang(currentLang === 'nl' ? 'en' : 'nl');
  });
});
