// Local-only static preview, including the production static rewrites (never proxies /verify).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(new URL("../", import.meta.url).pathname);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const route = /^\/listing\/[^/]+$/.test(pathname)
      ? "/listing/index.html"
      : /^\/app(?:\/.*)?$/.test(pathname)
        ? "/app/index.html"
        : pathname;
    let file = path.resolve(root, "." + route);
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403).end();
      return;
    }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      res.setHeader(
        "Content-Type",
        types[path.extname(file)] || "application/json",
      );
      res.end(fs.readFileSync(file));
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(Number(process.env.PORT || 4173), "127.0.0.1", () =>
    console.log("Preview http://127.0.0.1:" + (process.env.PORT || 4173)),
  );
