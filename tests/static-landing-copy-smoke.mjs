import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const i18n = fs.readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const publicHtml = [index, fs.readFileSync(new URL('../pricing.html', import.meta.url), 'utf8')].join('\n');
const searchable = [index, i18n, script].join('\n');

assert.match(index, /id="waitlist-hero"/i, 'hero waitlist form should remain present');
assert.match(index, /heroWaitlistOffer/i, 'hero offer copy key should exist above the fold');
assert.match(searchable, /Eerste 100 krijgen 1 maand Pro gratis/i, 'Dutch first-100 Pro offer should exist');
assert.match(searchable, /First 100 get 1 month Pro free/i, 'English first-100 Pro offer should exist');
assert.match(index, /mobile-sticky-cta[^>]+data-cta-placement="mobile_sticky"/i, 'mobile sticky CTA should remain tracked');
assert.match(searchable, /Claim 1 maand Pro gratis/i, 'mobile/value CTA offer should exist');
assert.match(searchable, /Claim 1 month Pro free/i, 'English sticky CTA offer should exist');
assert.match(script, /initMobileStickyCtaVisibility/i, 'sticky CTA visibility controller should exist');
assert.match(script, /getElementById\('waitlist-hero'\)/i, 'sticky CTA visibility should use the hero waitlist form as its trigger');
assert.match(script, /IntersectionObserver/i, 'sticky CTA visibility should use IntersectionObserver');
assert.match(script, /formRect\.bottom\s*<=\s*0[\s\S]*is-visible/i, 'sticky CTA should appear only after the hero form scrolls out above the viewport');
assert.match(styles, /\.mobile-sticky-cta\s*\{[\s\S]*display:\s*none[\s\S]*\.mobile-sticky-cta\.is-visible\s*\{[\s\S]*display:\s*inline-flex/i, 'sticky CTA should be hidden by default and shown only via visibility class');
assert.match(styles, /body\s*\{\s*padding-bottom:\s*104px;/i, 'mobile layout should reserve bottom padding for sticky CTA');
assert.match(searchable, /Geen spam\. Alleen launch access en je Pro-voordeel als je bij de eerste 100 zit\./i, 'waitlist microcopy should exist');
assert.match(searchable, /Als je bij de eerste 100 zit, krijg je 1 maand Pro gratis/i, 'success copy should avoid overpromising eligibility');

assert.doesNotMatch(searchable, /countdown|aftellen|remaining spots|spots left|plekken over|nog \d+ plekken/i, 'no fake countdown or fake remaining-spots copy');
assert.doesNotMatch(publicHtml, /App Store|Google Play|Download|Downloaden/i, 'public app-store/download CTA copy should not be resurrected');

console.log('static landing copy smoke passed');
