// Both locales are fully rendered HTML: readable without JavaScript, shareable and crawlable.
// Preserve old campaign URLs such as /?lang=en without dropping UTM attribution or anchors.
(function routeLegacyLanguage() {
  document.documentElement.classList.add("js");
  const url = new URL(location.href);
  const requested = url.searchParams.get("lang");
  if (requested !== "en" && requested !== "nl") return;
  const current = /^\/en(?:\/|$)/.test(url.pathname) ? "en" : "nl";
  url.searchParams.delete("lang");
  if (current !== requested) {
    url.pathname =
      requested === "en"
        ? "/en" + url.pathname
        : url.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    location.replace(url.pathname + url.search + url.hash);
  } else {
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
})();
