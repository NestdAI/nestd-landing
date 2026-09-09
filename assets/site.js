(() => {
  const html = document.documentElement;
  const control = document.querySelector(".theme-switch");
  const preferences = [...document.querySelectorAll('input[name="theme"]')];
  function stored() {
    try {
      return localStorage.getItem("nestd-theme") || "system";
    } catch {
      return "system";
    }
  }
  function apply(value) {
    if (value === "light" || value === "dark") html.dataset.theme = value;
    else delete html.dataset.theme;
    preferences.forEach((input) => {
      input.checked = input.value === value;
    });
  }
  apply(stored());
  if (control) control.hidden = false;
  preferences.forEach((input) =>
    input.addEventListener("change", () => {
      apply(input.value);
      try {
        if (input.value === "system") localStorage.removeItem("nestd-theme");
        else localStorage.setItem("nestd-theme", input.value);
      } catch {}
    }),
  );
  window.addEventListener("storage", (e) => {
    if (e.key === "nestd-theme" || e.key === null) apply(stored());
  });
  // Progressive enhancement: never leave text hidden when scripts fail or motion is reduced.
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !motion.matches) {
    const animations = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const animation = entry.target.animate(
            [
              { opacity: 0.45, transform: "translateY(22px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" },
          );
          animations.add(animation);
          animation.finished
            .then(() => animations.delete(animation))
            .catch(() => {});
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        ".steps li,.reach-cards article,.search-illustration,.story-teaser-inner,.experiences-inner,.home-offer,.story-body article,.principles-grid article",
      )
      .forEach((el) => observer.observe(el));
    motion.addEventListener("change", () => {
      if (!motion.matches) return;
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    });
  }
  const motionControl = document.querySelector(".motion-control");
  if (motionControl) {
    motionControl.hidden = motion.matches;
    motionControl.addEventListener("click", () => {
      const paused = motionControl.getAttribute("aria-pressed") !== "true";
      motionControl.setAttribute("aria-pressed", String(paused));
      motionControl.textContent = paused
        ? motionControl.dataset.playLabel
        : motionControl.dataset.pauseLabel;
      motionControl
        .closest(".device-showcase")
        .classList.toggle("motion-paused", paused);
    });
    motion.addEventListener("change", () => {
      motionControl.hidden = motion.matches;
    });
  }
  // Keep native details/summary semantics and no-JS behavior; animate both directions.
  document.querySelectorAll('.faq-items details').forEach((details) => {
    const summary = details.querySelector('summary');
    let animation;
    let expanded = details.open;
    const settle = () => {
      animation?.cancel();
      animation = undefined;
      details.open = expanded;
      details.style.removeProperty('height');
      details.style.removeProperty('overflow');
    };
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      const start = details.getBoundingClientRect().height;
      expanded = !expanded;
      animation?.cancel();
      if (motion.matches || !details.animate) { settle(); return; }
      details.style.removeProperty('height');
      details.open = expanded;
      const end = details.getBoundingClientRect().height;
      details.open = true;
      details.style.overflow = 'hidden';
      animation = details.animate(
        [{ height: `${start}px` }, { height: `${end}px` }],
        { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
      animation.onfinish = settle;
    });
    motion.addEventListener('change', () => { if (motion.matches) settle(); });
    window.addEventListener('resize', () => { if (animation) settle(); });
  });
  // Native scrolling works without JS and on touch. No autoplay or focus theft.
  document.querySelectorAll('[data-review-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.proof-reviews');
    const slides = [...track.querySelectorAll('[data-review-slide]')];
    const prev = carousel.querySelector('[data-review-prev]');
    const next = carousel.querySelector('[data-review-next]');
    const dots = [...carousel.querySelectorAll('[data-review-index]')];
    const status = carousel.querySelector('[data-review-status]');
    let current = 0, timer;
    const position = (slide) => Math.min(slide.offsetLeft - slides[0].offsetLeft, track.scrollWidth - track.clientWidth);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      current = track.scrollLeft >= max - 3 ? slides.length - 1 : slides.reduce((best, slide, i) => Math.abs(position(slide) - track.scrollLeft) < Math.abs(position(slides[best]) - track.scrollLeft) ? i : best, 0);
      prev.disabled = track.scrollLeft < 3;
      next.disabled = track.scrollLeft >= max - 3;
      dots.forEach((dot, i) => i === current ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current'));
      status.textContent = `${current + 1} / ${slides.length}`;
    };
    const go = (index) => {
      current = Math.max(0, Math.min(index, slides.length - 1));
      track.scrollTo({left: position(slides[current]), behavior: motion.matches ? 'instant' : 'smooth'});
    };
    prev.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    track.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    track.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(update, 100); }, {passive: true});
    new ResizeObserver(update).observe(track);
    carousel.querySelector('.review-controls').hidden = false;
    update();
  });
  const current = new URL(location.href),
    queryLanguage = current.searchParams.get("lang");
  // Explicit query links remain supported; language paths work even without JavaScript.
  if (["en", "nl"].includes(queryLanguage) && queryLanguage !== html.lang) {
    current.pathname =
      queryLanguage === "en"
        ? "/en" + current.pathname
        : current.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    current.searchParams.delete("lang");
    location.replace(current.href);
    return;
  }
  document.querySelectorAll("[data-language]").forEach((link) => {
    const target = new URL(link.href);
    target.search = current.search;
    target.searchParams.delete("lang");
    target.hash = current.hash;
    link.href = target.href;
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    if (link.dataset.ctaPlacement) {
      window.nestdAnalytics?.track("cta_clicked", {
        content_name: "app_store_cta",
        content_category: "app_download",
        placement: link.dataset.ctaPlacement,
        href: link.href,
        label: link.textContent.trim(),
      });
      window.nestdAnalytics?.trackMeta("ViewContent", {
        content_name: "app_store_cta",
        content_category: "app_download",
        placement: link.dataset.ctaPlacement,
      });
    } else if (link.closest("nav"))
      window.nestdAnalytics?.track("navigation_clicked", {
        label: link.textContent.trim(),
        href: link.getAttribute("href"),
        location: link.closest("footer") ? "footer" : "nav",
      });
  });
})();
