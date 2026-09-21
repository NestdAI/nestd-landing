(() => {
  "use strict";

  // The illustration is complete without JavaScript. Motion is an optional demo.
  if (
    typeof window.matchMedia !== "function" ||
    !window.CSS?.supports?.("translate", "0 1px")
  )
    return;

  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (
    typeof preference.addEventListener !== "function" &&
    typeof preference.addListener !== "function"
  )
    return;

  document.querySelectorAll("[data-alert-demo]").forEach((demo) => {
    const visual = demo.querySelector("[data-alert-visual]");
    const replay = demo.querySelector("[data-alert-replay]");
    if (!visual || !replay || typeof visual.animate !== "function") return;

    let activeAnimation = null;
    let observer = null;
    let automaticPlayed = preference.matches;
    let available = true;

    function cancel() {
      activeAnimation?.cancel();
      activeAnimation = null;
    }

    function play() {
      if (preference.matches || !available) return;

      // Preserve an interrupted demo's presentation value. Independent translate
      // also keeps each design's existing rotation and responsive transform.
      const current = activeAnimation ? window.getComputedStyle(visual) : null;
      const from = current
        ? { translate: current.translate, opacity: current.opacity }
        : { translate: "0 18px", opacity: 0.35 };
      cancel();

      try {
        const animation = visual.animate(
          [from, { translate: "0 0", opacity: 1 }],
          { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
        );
        activeAnimation = animation;
        animation.onfinish = () => {
          if (activeAnimation === animation) activeAnimation = null;
        };
      } catch {
        available = false;
        replay.hidden = true;
        observer?.disconnect();
      }
    }

    function syncPreference() {
      replay.hidden = preference.matches || !available;
      if (preference.matches) {
        cancel();
        automaticPlayed = true;
        observer?.disconnect();
      }
    }

    replay.addEventListener("click", () => {
      automaticPlayed = true;
      observer?.disconnect();
      play();
    });

    if (typeof preference.addEventListener === "function") {
      preference.addEventListener("change", syncPreference);
    } else {
      preference.addListener(syncPreference);
    }
    syncPreference();

    if (!automaticPlayed && typeof window.IntersectionObserver === "function") {
      try {
        observer = new window.IntersectionObserver(
          (entries) => {
            if (
              !automaticPlayed &&
              entries.some(
                (entry) =>
                  entry.target === visual &&
                  entry.isIntersecting &&
                  entry.intersectionRatio >= 0.15,
              )
            ) {
              automaticPlayed = true;
              observer.disconnect();
              play();
            }
          },
          { threshold: 0.15 },
        );
        observer.observe(visual);
      } catch {
        // Without viewport observation, the static demo still supports replay.
        observer?.disconnect();
      }
    }
  });
})();
