import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../contact.js", import.meta.url),
  "utf8",
);
const endpoint =
  "https://uauoewczlexhbhvxcrjg.supabase.co/functions/v1/contact-form";

function setup({
  fetchResult = async () => ({ ok: true }),
  fetchAvailable = true,
} = {}) {
  const calls = [];
  const privacyCalls = [];
  const timers = new Map();
  let timerId = 0;
  const statuses = Object.fromEntries(
    ["idle", "loading", "success", "error", "invalid"].map((value) => [
      value,
      {
        dataset: { contactStatus: value },
        hidden: value !== "idle",
        textContent: value,
      },
    ]),
  );
  const labels = ["idle", "loading"].map((value) => ({
    dataset: { contactSubmitLabel: value },
    hidden: value !== "idle",
  }));
  const fields = Object.fromEntries(
    ["name", "email", "message"].map((name) => [
      name,
      {
        value: "",
        disabled: false,
        attributes: {},
        focused: false,
        setAttribute(key, value) {
          this.attributes[key] = value;
        },
        removeAttribute(key) {
          delete this.attributes[key];
        },
        focus() {
          this.focused = true;
        },
      },
    ]),
  );
  const submit = { disabled: false };
  let listener;
  const form = {
    hidden: true,
    noValidate: false,
    resets: 0,
    attributes: {},
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    addEventListener(type, fn) {
      if (type === "submit") listener = fn;
    },
    querySelectorAll(selector) {
      if (selector === "[data-contact-status]") return Object.values(statuses);
      if (selector === "[data-contact-submit-label]") return labels;
      return [];
    },
    reset() {
      this.resets += 1;
      for (const field of Object.values(fields)) field.value = "";
    },
  };
  const ids = { "contact-form": form, "contact-submit": submit };
  for (const [name, field] of Object.entries(fields))
    ids[`contact-${name}`] = field;
  const document = { getElementById: (key) => ids[key] || null };
  const privacySpy = (...values) => privacyCalls.push(values);
  const window = {
    nestdAnalytics: { track: privacySpy },
    posthog: { capture: privacySpy },
    fbq: privacySpy,
    history: { replaceState: privacySpy, pushState: privacySpy },
    localStorage: { setItem: privacySpy },
    sessionStorage: { setItem: privacySpy },
  };
  const context = vm.createContext({
    document,
    window,
    AbortController,
    fetch: fetchAvailable
      ? async (url, init) => {
          calls.push({ url, init });
          return fetchResult(url, init);
        }
      : undefined,
    setTimeout(fn, delay) {
      const id = ++timerId;
      timers.set(id, { fn, delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    console: { log: privacySpy, error: privacySpy, warn: privacySpy },
  });
  vm.runInContext(source, context);
  function fill(values = {}) {
    const current = {
      name: "  Nina Example  ",
      email: "  nina@example.com  ",
      message: "  Ik heb een vraag over Nestd.  ",
      ...values,
    };
    for (const [name, value] of Object.entries(current))
      fields[name].value = value;
  }
  return {
    form,
    fields,
    submit,
    statuses,
    calls,
    privacyCalls,
    timers,
    labels,
    fill,
    send() {
      let prevented = false;
      const result = listener?.({
        preventDefault() {
          prevented = true;
        },
      });
      return {
        result,
        get prevented() {
          return prevented;
        },
      };
    },
  };
}

function assertPrivate(env) {
  assert.deepEqual(
    env.privacyCalls,
    [],
    "No form value or submission reaches telemetry, logs, URL or storage",
  );
}

test("progressive enhancement reveals the form only when request support exists", () => {
  assert.equal(setup().form.hidden, false);
  assert.equal(setup({ fetchAvailable: false }).form.hidden, true);
});

test("blank, malformed and overlong fields prevent a request and preserve entered text", async () => {
  for (const [key, value] of [
    ["name", "   "],
    ["email", "not-an-email"],
    ["email", "person@example.com\nBcc:bad@example.com"],
    ["message", "\n  "],
    ["name", "a".repeat(121)],
    ["email", `${"a".repeat(250)}@x.com`],
    ["message", "a".repeat(5001)],
  ]) {
    const env = setup();
    env.fill({ [key]: value });
    const submission = env.send();
    await submission.result;
    assert.equal(submission.prevented, true);
    assert.equal(env.calls.length, 0, key);
    assert.equal(env.fields[key].value, value);
    assert.equal(env.fields[key].focused, true);
    assert.equal(env.fields[key].attributes["aria-invalid"], "true");
    assert.equal(env.statuses.invalid.hidden, false);
    assert.equal(env.form.resets, 0);
    assertPrivate(env);
  }
});

test("success sends only the trimmed API contract with omitted credentials, then resets", async () => {
  const env = setup();
  env.fill();
  await env.send().result;
  assert.equal(env.calls.length, 1);
  const { url, init } = env.calls[0];
  assert.equal(url, endpoint);
  assert.equal(init.method, "POST");
  assert.equal(init.headers["Content-Type"], "application/json");
  assert.equal(init.credentials, "omit");
  assert.equal(init.referrerPolicy, "no-referrer");
  assert.deepEqual(JSON.parse(init.body), {
    name: "Nina Example",
    email: "nina@example.com",
    message: "Ik heb een vraag over Nestd.",
  });
  assert.deepEqual(Object.keys(init.headers), ["Content-Type"]);
  assert.equal(env.form.resets, 1);
  assert.equal(env.statuses.success.hidden, false);
  assert.equal(env.submit.disabled, false);
  assert.equal(env.timers.size, 0);
  assertPrivate(env);
});

test("a second submit while pending cannot send a duplicate, and fields stay stable", async () => {
  let complete;
  const env = setup({
    fetchResult: () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  });
  env.fill();
  const pending = env.send().result;
  await env.send().result;
  assert.equal(env.calls.length, 1);
  assert.equal(env.submit.disabled, true);
  assert.ok(Object.values(env.fields).every((field) => field.disabled));
  assert.equal(env.statuses.loading.hidden, false);
  assert.equal(env.form.attributes["aria-busy"], "true");
  complete({ ok: true });
  await pending;
  assert.ok(Object.values(env.fields).every((field) => !field.disabled));
  assert.equal(env.form.attributes["aria-busy"], "false");
  assertPrivate(env);
});

test("HTTP rejection and network failure preserve the message, report failure and never retry", async () => {
  for (const fetchResult of [
    async () => ({ ok: false, status: 429 }),
    async () => {
      throw new Error("offline");
    },
  ]) {
    const env = setup({ fetchResult });
    env.fill();
    await env.send().result;
    assert.equal(env.calls.length, 1);
    assert.equal(env.fields.email.value, "  nina@example.com  ");
    assert.equal(env.fields.message.value, "  Ik heb een vraag over Nestd.  ");
    assert.equal(env.form.resets, 0);
    assert.equal(env.statuses.error.hidden, false);
    assert.equal(env.submit.disabled, false);
    assert.equal(env.timers.size, 0);
    assertPrivate(env);
  }
});

test("the 15-second deadline aborts the request without retrying or losing input", async () => {
  const env = setup({
    fetchResult: (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener(
          "abort",
          () => reject(new Error("aborted")),
          { once: true },
        );
      }),
  });
  env.fill();
  const pending = env.send().result;
  const timer = [...env.timers.values()][0];
  assert.equal(timer.delay, 15000);
  timer.fn();
  await pending;
  assert.equal(env.calls[0].init.signal.aborted, true);
  assert.equal(env.calls.length, 1);
  assert.equal(env.form.resets, 0);
  assert.equal(env.fields.name.value, "  Nina Example  ");
  assert.equal(env.statuses.error.hidden, false);
  assert.equal(env.submit.disabled, false);
  assert.equal(env.timers.size, 0);
  assertPrivate(env);
});

test("status transitions preserve translated inline copy instead of replacing it", async () => {
  const env = setup();
  env.fill();
  env.statuses.success.textContent = "Message sent";
  await env.send().result;
  assert.equal(env.statuses.success.textContent, "Message sent");
  assert.equal(env.statuses.success.hidden, false);
});
