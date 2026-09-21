import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const pages=['index.html','about.html','pricing.html','privacy.html'];
test('English pages are complete, deterministic, and do not need a redirect or JavaScript',()=>{
 const before=pages.map(p=>fs.readFileSync(new URL('../en/'+p,import.meta.url),'utf8'));
 execFileSync(process.execPath,['scripts/build-locales.mjs']);
 for(const [i,name] of pages.entries()){
  const html=fs.readFileSync(new URL('../en/'+name,import.meta.url),'utf8');
  assert.equal(html,before[i],name+' generated page drift');
  assert.match(html,/<html lang="en">/); assert.match(html,/<main\b/);
  assert.doesNotMatch(html,/window.location.replace|http-equiv="refresh"|content="undefined"/);
  assert.match(html,/<link rel="canonical" href="https:\/\/www.nestd.nl\/en\//);
  assert.match(html,/hreflang="nl"/);assert.match(html,/hreflang="en"/);
 }
});
test('deployment includes public assets but no source, test or dependency directories',()=>{
 execFileSync(process.execPath,['scripts/package-site.mjs']);
 for(const p of ['index.html','en/privacy.html','images/social-card.png','images/download-qr.svg','.well-known/apple-app-site-association','app/index.html','listing/index.html','robots.txt','sitemap.xml']) assert.ok(fs.existsSync('dist/'+p),p);
 for(const p of ['node_modules','docs','tests','scripts','.git','.github','package.json']) assert.equal(fs.existsSync('dist/'+p),false,p);
 for(const p of pages) assert.equal(fs.readFileSync('dist/'+p,'utf8'),fs.readFileSync(p,'utf8'));
});
