import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const store = 'https://apps.apple.com/nl/app/nestd/id6761392857';
for (const page of ['index.html', 'about.html', 'pricing.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const copy = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  assert.doesNotMatch(copy, /\bAI\b|chatbot|swip(?:e|en|ing)?|duo\s+(?:zoeken|search)|auto[- ]?(?:react|apply)|wachtlijst|waitlist|pre-launch|eerste 100|first 100|meest gekozen|most popular|most chosen|\d+%\s*match/i, `${page}: removed product claims`);
  assert.doesNotMatch(copy, /snelste|fastest|binnen \d+ seconden|within \d+ seconds|\d+\+\s*(?:websites|huurwebsites)/i, `${page}: unsupported proof`);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1|facebook\.com\/tr|<form\b|<input\b/i, `${page}: privacy/accessibility regression`);
  assert.match(html, /id="lang-toggle"/, `${page}: language control`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: duplicate IDs`);
  const ctas = [...html.matchAll(/<a\b[^>]*data-cta-placement="[^"]+"[^>]*>/g)];
  assert.ok(ctas.length, `${page}: download CTA`);
  for (const [tag] of ctas) {
    assert.ok(tag.includes(`href="${store}"`), `${page}: verified native App Store link`);
    assert.match(tag, /rel="[^"]*noopener/, `${page}: safe new tab`);
  }
  for (const [tag] of html.matchAll(/<[^!][^>]*\bdata-nl="[^"]*"[^>]*>/g)) {
    assert.match(tag, /data-en="[^"]+"/, `${page}: missing English translation`);
  }
  for (const [, href] of html.matchAll(/href="#([^"]*)"/g)) {
    assert.ok(href && ids.includes(href), `${page}: broken local anchor #${href}`);
  }
  for (const [, resource] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(resource) || resource === '/') continue;
    const local = path.resolve(root, resource.replace(/^\//, '').split(/[?#]/)[0]);
    assert.ok(fs.existsSync(local), `${page}: missing resource ${resource}`);
  }
}
for (const page of ['app/index.html', 'listing/index.html', 'verified/index.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.doesNotMatch(html, /id6740091498|AI-powered|chat with AI/i, `${page}: stale download fallback`);
}
console.log('Static alerts landing contract passed');
