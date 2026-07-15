import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const i18n = fs.readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const publicHtml = [index, fs.readFileSync(new URL('../pricing.html', import.meta.url), 'utf8')].join('\n');
const searchable = [index, i18n, script].join('\n');

function readJpegDimensions(buffer) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8, 'hero listing image should be a JPEG');

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;

    const segmentLength = buffer.readUInt16BE(offset);
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }

  assert.fail('hero listing image should contain JPEG dimensions');
}

const heroListingSrc = index.match(/class="match-spotlight"[\s\S]*?<img[^>]+src="([^"]+)"/i)?.[1];
assert.ok(heroListingSrc, 'hero listing image should remain present');
const heroListingDimensions = readJpegDimensions(fs.readFileSync(new URL(`../${heroListingSrc}`, import.meta.url)));
assert.ok(
  heroListingDimensions.width >= 600 && heroListingDimensions.height >= 500,
  `hero listing image should be retina-ready, received ${heroListingDimensions.width}x${heroListingDimensions.height}`,
);

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
