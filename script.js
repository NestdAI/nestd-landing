// Analytics — PostHog is the source of truth; Meta Pixel is for ads optimization only.
(function initMarketingAnalytics() {
  const POSTHOG_KEY =
    window.NESTD_POSTHOG_KEY ||
    document.querySelector('meta[name="posthog-key"]')?.content ||
    "";
  const POSTHOG_HOST = "https://eu.i.posthog.com";
  const META_PIXEL_ID =
    window.NESTD_META_PIXEL_ID ||
    document.querySelector('meta[name="facebook-pixel-id"]')?.content ||
    "1435983921187208";
  const META_STANDARD_EVENTS = new Set([
    "AddPaymentInfo",
    "AddToCart",
    "AddToWishlist",
    "CompleteRegistration",
    "Contact",
    "CustomizeProduct",
    "Donate",
    "FindLocation",
    "InitiateCheckout",
    "Lead",
    "PageView",
    "Purchase",
    "Schedule",
    "Search",
    "StartTrial",
    "SubmitApplication",
    "Subscribe",
    "ViewContent",
  ]);
  const POSTHOG_QUEUE = [];
  let posthogReady = false;
  const FIRST_TOUCH_STORAGE_KEY = "nestd_attribution_first_touch_v1";
  const CURRENT_TOUCH_STORAGE_KEY = "nestd_attribution_current_touch_v1";
  const ATTRIBUTION_FIELDS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
  ];
  const ATTRIBUTION_CONTEXT_FIELDS = [
    "landing_page",
    "referrer",
    "captured_at",
  ];
  const SENSITIVE_ANALYTICS_KEYS = new Set(["email", "phone", "name"]);

  // Meta Pixel may implicitly receive page URL/referrer from the browser.
  // Keep it limited to safe public marketing/deeplink contexts and never load
  // it on listing/product routes or when unknown query params/referrers could
  // leak raw listing identifiers or sensitive preferences.
  const META_SAFE_QUERY_KEYS = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
    "lang",
  ]);

  function isListingPath(pathname = "") {
    return /^\/listing(?:\/|$)/.test(pathname);
  }

  function isMetaPixelAllowedPath(pathname = window.location.pathname) {
    const normalizedPath =
      pathname.replace(/^\/en(?=\/|$)/, "").replace(/\/index\.html$/, "/") ||
      "/";
    if (isListingPath(normalizedPath)) return false;
    if (normalizedPath === "/" || normalizedPath === "/index.html") return true;
    if (normalizedPath === "/en" || normalizedPath === "/en/") return true;
    if (
      normalizedPath === "/about.html" ||
      normalizedPath === "/pricing.html" ||
      normalizedPath === "/privacy.html" ||
      normalizedPath === "/download.html"
    )
      return true;
    if (
      normalizedPath === "/app" ||
      normalizedPath === "/app/" ||
      normalizedPath === "/app/index.html"
    )
      return true;
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
      return (
        parsed.origin === window.location.origin &&
        isListingPath(parsed.pathname)
      );
    } catch {
      return true;
    }
  }

  function isMetaPixelAllowedContext() {
    return (
      isMetaPixelAllowedPath() &&
      hasOnlyMetaSafeQueryParams() &&
      !hasSensitiveReferrer()
    );
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

  function compactObject(object = {}) {
    return Object.entries(object).reduce((compact, [key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        compact[key] = value;
      return compact;
    }, {});
  }

  function readStoredAttribution(storage, key) {
    try {
      const raw = storage?.getItem?.(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeStoredAttribution(storage, key, value) {
    try {
      storage?.setItem?.(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private browsing or blocked embeds.
    }
  }

  function getBrowserStorage(kind) {
    try {
      return window[kind];
    } catch {
      return null;
    }
  }

  function getLanguage() {
    try {
      return (
        document.documentElement.lang ||
        localStorage.getItem("nestd-lang") ||
        "nl"
      );
    } catch {
      return document.documentElement.lang || "nl";
    }
  }

  function getAttributionFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const attribution = {
      landing_page: safeUrl(window.location.href),
      referrer: safeUrl(document.referrer),
      captured_at: new Date().toISOString(),
    };

    ATTRIBUTION_FIELDS.forEach((field) => {
      const value = params.get(field);
      if (value) attribution[field] = value;
    });

    return compactObject(attribution);
  }

  function hasCampaignAttribution(attribution = {}) {
    return ATTRIBUTION_FIELDS.some((field) => Boolean(attribution[field]));
  }

  function persistAttribution() {
    const pageAttribution = getAttributionFromLocation();
    const localStorageRef = getBrowserStorage("localStorage");
    const sessionStorageRef = getBrowserStorage("sessionStorage");
    let firstTouch = readStoredAttribution(
      localStorageRef,
      FIRST_TOUCH_STORAGE_KEY,
    );
    let currentTouch = readStoredAttribution(
      sessionStorageRef,
      CURRENT_TOUCH_STORAGE_KEY,
    );

    if (!firstTouch) {
      firstTouch = pageAttribution;
      writeStoredAttribution(
        localStorageRef,
        FIRST_TOUCH_STORAGE_KEY,
        firstTouch,
      );
    }

    // Current-touch should survive same-session navigation/language changes, but
    // refresh when a new ad/social/search click brings explicit attribution.
    if (!currentTouch || hasCampaignAttribution(pageAttribution)) {
      currentTouch = pageAttribution;
      writeStoredAttribution(
        sessionStorageRef,
        CURRENT_TOUCH_STORAGE_KEY,
        currentTouch,
      );
    }

    return { firstTouch, currentTouch, pageAttribution };
  }

  const initialAttribution = persistAttribution();

  function getPersistedAttribution() {
    return {
      firstTouch:
        readStoredAttribution(
          getBrowserStorage("localStorage"),
          FIRST_TOUCH_STORAGE_KEY,
        ) ||
        initialAttribution.firstTouch ||
        initialAttribution.pageAttribution,
      currentTouch:
        readStoredAttribution(
          getBrowserStorage("sessionStorage"),
          CURRENT_TOUCH_STORAGE_KEY,
        ) ||
        initialAttribution.currentTouch ||
        initialAttribution.pageAttribution,
    };
  }

  function attributionSnapshot(attribution = {}) {
    return [...ATTRIBUTION_FIELDS, ...ATTRIBUTION_CONTEXT_FIELDS].reduce(
      (payload, field) => {
        if (
          attribution[field] !== undefined &&
          attribution[field] !== null &&
          attribution[field] !== ""
        ) {
          payload[field] = attribution[field];
        }
        return payload;
      },
      {},
    );
  }

  function prefixedAttribution(prefix, attribution = {}) {
    return Object.entries(attributionSnapshot(attribution)).reduce(
      (payload, [field, value]) => {
        payload[`${prefix}_${field}`] = value;
        return payload;
      },
      {},
    );
  }

  function stripSensitiveAnalyticsProperties(properties = {}) {
    return Object.entries(properties).reduce((safe, [key, value]) => {
      if (!SENSITIVE_ANALYTICS_KEYS.has(String(key).toLowerCase()))
        safe[key] = value;
      return safe;
    }, {});
  }

  function getAttributionPayload(properties = {}) {
    const { firstTouch, currentTouch } = getPersistedAttribution();
    const currentAttribution = compactObject({
      ...ATTRIBUTION_FIELDS.reduce((payload, field) => {
        payload[field] = currentTouch?.[field];
        return payload;
      }, {}),
      landing_page: currentTouch?.landing_page,
      referrer: currentTouch?.referrer,
      captured_at: currentTouch?.captured_at,
    });

    return compactObject({
      path: window.location.pathname,
      url: safeUrl(window.location.href),
      language: getLanguage(),
      ...currentAttribution,
      ...prefixedAttribution("first_touch", firstTouch),
      ...prefixedAttribution("current_touch", currentTouch),
      first_touch: attributionSnapshot(firstTouch),
      current_touch: attributionSnapshot(currentTouch),
      ...properties,
    });
  }

  function sanitizeMetaProperties(properties = {}) {
    const allowedKeys = new Set([
      "content_name",
      "content_category",
      "placement",
    ]);
    return Object.entries(properties).reduce((safe, [key, value]) => {
      if (
        allowedKeys.has(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      )
        safe[key] = value;
      return safe;
    }, {});
  }

  function loadMetaPixel() {
    if (!META_PIXEL_ID || window.fbq || !isMetaPixelAllowedContext()) return;

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js",
    );

    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function trackMeta(event, properties = {}) {
    if (!META_PIXEL_ID || !window.fbq || !isMetaPixelAllowedContext()) return;
    const method = META_STANDARD_EVENTS.has(event) ? "track" : "trackCustom";
    const payload = sanitizeMetaProperties(properties);
    if (Object.keys(payload).length > 0) window.fbq(method, event, payload);
    else window.fbq(method, event);
  }

  window.nestdAnalytics = {
    track(event, properties = {}) {
      const payload = getAttributionPayload(
        stripSensitiveAnalyticsProperties(properties),
      );
      if (posthogReady && window.posthog?.capture) {
        window.posthog.capture(event, payload);
        return;
      }
      if (POSTHOG_KEY) POSTHOG_QUEUE.push([event, payload]);
    },
    trackMeta,
    getAttribution() {
      return getAttributionPayload();
    },
    getWaitlistAttribution() {
      return getAttributionPayload({ source: "landing" });
    },
  };

  loadMetaPixel();

  if (!POSTHOG_KEY) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://eu-assets.i.posthog.com/static/array.js";
  script.onload = function () {
    window.posthog?.init?.(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: "2026-01-30",
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: true,
      person_profiles: "identified_only",
    });
    posthogReady = true;
    window.nestdAnalytics.track("page_view");
    while (POSTHOG_QUEUE.length) {
      const [event, payload] = POSTHOG_QUEUE.shift();
      window.posthog?.capture?.(event, payload);
    }
  };
  document.head.appendChild(script);
})();

// Accessible, non-modal mobile navigation. No focus trap; Escape restores the trigger.
(function initNavigation() {
  document.body.classList.add("js-ready");
  const button = document.querySelector(".menu-toggle");
  const nav = document.getElementById("navigation");
  function close() {
    if (!button || !nav) return;
    nav.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    button.textContent = button.dataset.menuLabel;
  }
  button?.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    nav?.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open
      ? button.dataset.closeLabel
      : button.dataset.menuLabel;
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      button?.getAttribute("aria-expanded") === "true"
    ) {
      close();
      button.focus();
    }
  });
  nav?.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });
  document.querySelectorAll(".language-link").forEach((link) => {
    const target = new URL(link.href);
    // Language switch preserves only marketing attribution; no unknown/private query values.
    for (const [key, value] of new URLSearchParams(location.search)) {
      if (
        /^utm_(source|medium|campaign|content|term)$/.test(key) ||
        key === "fbclid" ||
        key === "gclid"
      )
        target.searchParams.set(key, value);
    }
    target.hash = location.hash;
    link.href = target.pathname + target.search + target.hash;
  });
})();

(function initMarketingClickTracking() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a");
    if (!link) return;
    const placement = link.dataset.ctaPlacement;
    const isStore =
      link.hostname === "apps.apple.com" &&
      link.pathname.endsWith("/id6761392857");
    if (placement && isStore) {
      window.nestdAnalytics?.track("cta_clicked", {
        content_name: "app_store_cta",
        content_category: "app_download",
        store: "apple",
        placement,
        href: link.href.split("?")[0],
      });
      window.nestdAnalytics?.trackMeta("ViewContent", {
        content_name: "app_store_cta",
        content_category: "app_download",
        placement,
      });
      // A store visit is not a download, subscription, lead or purchase.
    } else if (link.closest(".site-header, .site-footer")) {
      window.nestdAnalytics?.track("navigation_clicked", {
        label: link.textContent.trim(),
        href: link.getAttribute("href").split("?")[0],
        location: link.closest(".site-footer") ? "footer" : "nav",
      });
    }
  });
})();

(function initSectionViewTracking() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const name = entry.target.dataset.section;
        window.nestdAnalytics?.track(`${name}_section_viewed`);
        observer.unobserve(entry.target);
      }),
    { threshold: 0.2 },
  );
  document
    .querySelectorAll("[data-section]")
    .forEach((section) => observer.observe(section));
})();

(function initFaqTracking() {
  document.querySelectorAll(".faq details").forEach((item, index) =>
    item.addEventListener("toggle", () => {
      if (item.open)
        window.nestdAnalytics?.track("faq_opened", { question_index: index });
    }),
  );
})();

(function initMobileStickyCtaVisibility() {
  const sticky = document.querySelector(".mobile-sticky");
  const hero = document.querySelector(".hero-actions");
  const download = document.getElementById("download");
  const footer = document.querySelector(".site-footer");
  if (!sticky || !hero) return;
  function update() {
    const reachedDownload =
      download && download.getBoundingClientRect().top < innerHeight;
    const reachedFooter =
      footer && footer.getBoundingClientRect().top < innerHeight;
    sticky.hidden =
      innerWidth > 760 ||
      hero.getBoundingClientRect().bottom > 0 ||
      reachedDownload ||
      reachedFooter;
  }
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
})();
