// Progressive enhancement: without JS every step is readable in order.
// This is an explanatory illustration, never a search form or a backend request.
(function () {
  const widget = document.querySelector("[data-demo]");
  if (!widget) return;
  const list = widget.querySelector("[data-demo-tabs]");
  const tabs = [...widget.querySelectorAll("[data-demo-tab]")];
  const panels = [...widget.querySelectorAll("[data-demo-panel]")];
  list.setAttribute("role", "tablist");
  tabs.forEach((tab, i) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[i].id);
  });
  panels.forEach((panel, i) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabs[i].id);
    panel.tabIndex = 0;
  });
  function show(index, interaction) {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (interaction)
      window.nestdAnalytics?.track("demo_step_viewed", {
        step: index + 1,
        interaction,
      });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => show(index, "click"));
    tab.addEventListener("keydown", (event) => {
      const next =
        event.key === "ArrowRight"
          ? (index + 1) % tabs.length
          : event.key === "ArrowLeft"
            ? (index + tabs.length - 1) % tabs.length
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? tabs.length - 1
                : null;
      if (next === null) return;
      event.preventDefault();
      show(next, "keyboard");
      tabs[next].focus();
    });
  });
  show(0);
  list.hidden = false;
})();
