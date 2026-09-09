// Blocking head script: apply a saved choice before styles can paint the page.
// With JavaScript unavailable, CSS alone follows the operating-system preference.
(function () {
  const root = document.documentElement;
  let choice = "system";
  try {
    const saved = localStorage.getItem("nestd-theme");
    if (saved === "light" || saved === "dark") choice = saved;
  } catch {
    /* Storage can be unavailable in private/locked-down browsers. */
  }
  function apply(value) {
    choice = ["light", "dark"].includes(value) ? value : "system";
    if (choice === "system") delete root.dataset.theme;
    else root.dataset.theme = choice;
    document.querySelectorAll("[data-theme-select]").forEach((select) => {
      select.value = choice;
    });
  }
  apply(choice);
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-control]").forEach((control) => {
      control.hidden = false;
    });
    document.querySelectorAll("[data-theme-select]").forEach((select) => {
      select.value = choice;
      select.addEventListener("change", () => {
        apply(select.value);
        try {
          if (choice === "system") localStorage.removeItem("nestd-theme");
          else localStorage.setItem("nestd-theme", choice);
        } catch {
          /* The current-page preference remains usable without storage. */
        }
      });
    });
  });
  addEventListener("storage", (event) => {
    if (event.key === "nestd-theme" || event.key === null)
      apply(event.newValue);
  });
})();
