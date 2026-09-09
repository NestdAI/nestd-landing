// App opening requires a user gesture. Never navigate back to the same web URL.
(function () {
  const main = document.querySelector("[data-kind]");
  const link = document.getElementById("open-app");
  if (!main || !link) return;
  const isListing = main.dataset.kind === "listing";
  if (isListing) {
    const raw = location.pathname.split("/")[2] || "";
    // Listing identifiers are bounded; never interpolate arbitrary query parameters.
    const id =
      /^[a-zA-Z0-9_-]{1,128}$/.test(raw) && raw !== "index.html" ? raw : "";
    link.href = id ? "nestd://listing/" + encodeURIComponent(id) : "nestd://";
    // No analytics on listing routes: URLs contain identifiers.
    return;
  }
  window.nestdAnalytics?.track("app_deeplink_viewed");
  let attemptedAt = 0;
  link.addEventListener("click", () => {
    attemptedAt = Date.now();
    window.nestdAnalytics?.track("app_deeplink_attempted");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && attemptedAt && Date.now() - attemptedAt < 3000) {
      window.nestdAnalytics?.track("app_deeplink_opened"); // Best-effort signal, not verified app open.
      attemptedAt = 0;
    }
  });
})();
