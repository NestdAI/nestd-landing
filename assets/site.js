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
