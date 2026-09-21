import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
const require = createRequire(import.meta.url);
const base = process.env.SITE_URL || 'http://127.0.0.1:4187';
const out = path.resolve('test-results');fs.mkdirSync(out,{recursive:true});
const browser = await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
const results=[];
async function context(options={}) {
 const c=await browser.newContext(options);
 await c.route(/posthog\.com|facebook\.net|facebook\.com/,r=>r.abort());
 return c;
}
try {
 for(const width of [320,390,768,1440]) for(const locale of ['nl','en']) for(const route of ['','about.html','pricing.html','privacy.html']) {
  const c=await context({viewport:{width,height:900},reducedMotion:'reduce'});const p=await c.newPage();
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const response=await p.goto(`${base}/${locale==='en'?'en/':''}${route}`,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.locator('html').getAttribute('lang'),locale);
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${width}/${locale}/${route} overflow`);
  assert.equal(await p.locator('main h1').count(),1);
  assert.equal(await p.locator('[data-review-placeholder]').count(),0);
  assert.equal(await p.locator('form, a[href="mailto:hello@nestd.nl"], a[href*="about.html#contact"], script[src="/contact.js"]').count(),0);
  await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));
  assert.deepEqual(await p.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
  await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const axe=await p.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  assert.deepEqual(axe,[],`${width}/${locale}/${route} accessibility`);
  if(width<851){await p.locator('#menu-toggle').click();assert.equal(await p.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await p.keyboard.press('Escape');assert.equal(await p.locator('#menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(await p.locator('#menu-toggle').evaluate(n=>document.activeElement===n),true);}
  if(!route){
   await p.locator('#hoe-het-werkt').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));
   if(width<768) {await p.locator('[data-sticky-cta]').waitFor({state:'visible'});}
   const q=p.locator('details').first();await q.locator('summary').click();assert.equal(await q.getAttribute('open'),'');
   await p.locator('#download').scrollIntoViewIfNeeded();await p.locator('[data-sticky-cta]').waitFor({state:'hidden'});
  }
  assert.deepEqual(errors,[]);
  if([390,1440].includes(width)){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,`${locale}-${route||'home'}-${width}.png`),fullPage:true});}
  results.push({width,locale,route:route||'home',overflow:false,axeViolations:0,errors:0});await c.close();
 }
 // English must be real HTML, including assets and usable mobile navigation without JS.
 for(const locale of ['nl','en']) for(const route of ['','about.html','pricing.html','privacy.html']) {
  const c=await context({javaScriptEnabled:false,viewport:{width:390,height:844}}); const p=await c.newPage();await p.goto(`${base}/${locale==='en'?'en/':''}${route}`);
  assert.equal(await p.locator('html').getAttribute('lang'),locale);
  const title=await p.locator('h1').innerText();assert.ok(title.length>8);
  if(locale==='en') {
    assert.doesNotMatch(title,/Nieuw te huur|zoektocht|Privacybeleid|Over Nestd/);
    assert.deepEqual(await p.locator('[data-en]:not(meta)').evaluateAll(es=>es.filter(e=>e.textContent.trim()!==e.getAttribute('data-en')).map(e=>e.tagName+': '+e.textContent.trim())),[]);
  }
  assert.equal(await p.locator('.site-nav-primary').isVisible(),true);assert.equal(await p.locator('#menu-toggle').isVisible(),false);
  await p.locator('#lang-toggle').click();assert.equal(await p.locator('html').getAttribute('lang'),locale==='nl'?'en':'nl');
  results.push({noJS:true,locale,route:route||'home'});await c.close();
 }
 // Translation keeps campaign and anchor, and navigates to real localized pages.
 {
  const c=await context();const p=await c.newPage();await p.goto(`${base}/?utm_source=qa#hoe-het-werkt`);await p.locator('#lang-toggle').click();assert.equal(new URL(p.url()).searchParams.get('utm_source'),'qa');assert.equal(new URL(p.url()).hash,'#hoe-het-werkt');await p.locator('.site-nav-primary a').filter({hasText:'Pricing'}).click();assert.equal(await p.locator('html').getAttribute('lang'),'en');assert.match(new URL(p.url()).pathname,/\/en\/pricing.html/);await c.close();results.push({languageNavigation:true});
 }
 fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(results,null,2));console.log(`${results.length} browser scenarios passed; screenshots and report in test-results.`);
} finally {await browser.close();}
