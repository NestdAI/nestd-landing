// Contact details go only to the existing contact endpoint, never to telemetry or storage.
(function initContactForm() {
  const form = document.getElementById("contact-form");
  if (
    !form ||
    typeof fetch !== "function" ||
    typeof AbortController !== "function"
  )
    return;

  const submit = document.getElementById("contact-submit");
  const fields = {
    name: document.getElementById("contact-name"),
    email: document.getElementById("contact-email"),
    message: document.getElementById("contact-message"),
  };
  if (!submit || Object.values(fields).some((field) => !field)) return;

  const limits = { name: 120, email: 254, message: 5000 };
  const statuses = form.querySelectorAll("[data-contact-status]");
  const buttonLabels = form.querySelectorAll("[data-contact-submit-label]");
  let pending = false;

  function showStatus(status) {
    statuses.forEach((node) => {
      node.hidden = node.dataset.contactStatus !== status;
    });
    buttonLabels.forEach((node) => {
      node.hidden =
        node.dataset.contactSubmitLabel !==
        (status === "loading" ? "loading" : "idle");
    });
  }

  function setPending(value) {
    pending = value;
    submit.disabled = value;
    Object.values(fields).forEach((field) => {
      field.disabled = value;
    });
    form.setAttribute("aria-busy", String(value));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;

    const payload = {};
    let firstInvalid;
    for (const [name, field] of Object.entries(fields)) {
      const value = field.value.trim();
      const invalid =
        !value ||
        value.length > limits[name] ||
        (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
      field.removeAttribute("aria-invalid");
      if (invalid) {
        field.setAttribute("aria-invalid", "true");
        firstInvalid ||= field;
      }
      payload[name] = value;
    }
    if (firstInvalid) {
      showStatus("invalid");
      firstInvalid.focus();
      return;
    }

    setPending(true);
    showStatus("loading");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        "https://uauoewczlexhbhvxcrjg.supabase.co/functions/v1/contact-form",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "omit",
          referrerPolicy: "no-referrer",
          signal: controller.signal,
        },
      );
      if (!response.ok || controller.signal.aborted)
        throw new Error("Contact request not accepted");
      form.reset();
      showStatus("success");
    } catch {
      // An uncertain or failed request is never retried automatically.
      showStatus("error");
    } finally {
      clearTimeout(timeout);
      setPending(false);
    }
  });

  // Without this script the email fallback remains available and no native form submits.
  form.noValidate = true;
  form.hidden = false;
})();
