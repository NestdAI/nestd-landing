(() => {
  const html = document.documentElement;
  const preference = document.getElementById("theme");
  const media = window.matchMedia("(prefers-color-scheme: dark)");
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
    if (preference)
      preference.value = ["light", "dark"].includes(value) ? value : "system";
  }
  apply(stored());
  preference?.addEventListener("change", () => {
    apply(preference.value);
    try {
      if (preference.value === "system") localStorage.removeItem("nestd-theme");
      else localStorage.setItem("nestd-theme", preference.value);
    } catch {}
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "nestd-theme") apply(stored());
  });
  media.addEventListener("change", () => {
    if (stored() === "system") apply("system");
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
