// Publish only the static website, not source, test reports or local tooling.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const directories = [
  "en",
  "images",
  "fonts",
  ".well-known",
  "app",
  "listing",
  "verified",
  "verify-error",
];
const files = [
  "index.html",
  "pricing.html",
  "about.html",
  "download.html",
  "privacy.html",
  "features.html",
  "admin.html",
  "styles.css",
  "themes.css",
  "theme.js",
  "pages.css",
  "script.js",
  "i18n.js",
  "deeplink.js",
  "favicon.ico",
  "logo.png",
  "apple-touch-icon.png",
  "robots.txt",
  "sitemap.xml",
];
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of [...files, ...directories]) {
  fs.cpSync(path.join(root, name), path.join(output, name), {
    recursive: true,
  });
}
console.log(
  "Packaged static website in dist/; source, dependencies and test artifacts excluded.",
);
