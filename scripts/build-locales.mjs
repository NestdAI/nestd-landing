// Bilingual root HTML is the source of truth. Generate complete English documents,
// not client-side redirects. Parsing handles entities, both quote styles and multiline tags.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, serialize } from 'parse5';
const root = fileURLToPath(new URL('..', import.meta.url));
const pages = ['index.html', 'about.html', 'pricing.html', 'privacy.html'];
const publicPaths = ['/', '/index.html', '/about.html', '/pricing.html', '/privacy.html'];
const get = (node, name) => node.attrs?.find(a => a.name === name)?.value;
function set(node, name, value) {
  const attr = node.attrs.find(a => a.name === name);
  if (attr) attr.value = value;
  else node.attrs.push({ name, value });
}
function text(node, value) { node.childNodes = [{ nodeName: '#text', value, parentNode: node }]; }
function walk(node, visit) { visit(node); for (const child of node.childNodes || []) walk(child, visit); }
for (const name of pages) {
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  const nlPath = name === 'index.html' ? '/' : `/${name}`;
  const enPath = name === 'index.html' ? '/en/' : `/en/${name}`;
  const document = parse(source);
  walk(document, node => {
    if (!node.tagName) return;
    if (node.tagName === 'html') set(node, 'lang', 'en');
    const translation = get(node, 'data-en');
    if (translation !== undefined) {
      if (node.tagName === 'meta') set(node, 'content', translation);
      else {
        if (node.childNodes.some(c => c.tagName)) throw new Error(`Non-leaf translation in ${name}: ${node.tagName}`);
        text(node, translation);
      }
    }
    for (const attribute of ['alt', 'aria-label']) {
      const value = get(node, attribute === 'alt' ? 'data-alt-en' : 'data-aria-en');
      if (value !== undefined) set(node, attribute, value);
    }
    if (get(node, 'id') === 'lang-toggle') {
      set(node, 'href', `${nlPath}?lang=nl`); set(node, 'lang', 'nl');
      set(node, 'aria-label', 'Wissel naar Nederlands'); text(node, 'NL');
    } else if (node.tagName === 'a') {
      const href = get(node, 'href');
      if (href?.startsWith('/') && !href.startsWith('//')) {
        const url = new URL(href, 'https://www.nestd.nl');
        if (publicPaths.includes(url.pathname)) {
          url.pathname = url.pathname === '/' || url.pathname === '/index.html' ? '/en/' : '/en' + url.pathname;
          set(node, 'href', `${url.pathname}${url.search}${url.hash}`);
        }
      }
    }
    if (node.tagName === 'link' && get(node, 'rel') === 'canonical') set(node, 'href', `https://www.nestd.nl${enPath}`);
  });
  fs.mkdirSync(path.join(root, 'en'), { recursive: true });
  fs.writeFileSync(path.join(root, 'en', name), serialize(document).replace(/[ \t]+$/gm, '') + '\n');
}
console.log('Generated four complete English pages.');
