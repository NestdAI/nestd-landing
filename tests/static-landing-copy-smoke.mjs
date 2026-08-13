import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const i18n = fs.readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const publicHtml = [index, fs.readFileSync(new URL('../pricing.html', import.meta.url), 'utf8')].join('\n');
const searchable = [index, i18n, script].join('\n');
const appStoreUrl = 'https://apps.apple.com/app/nestd/id6740091498';

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

assert.match(index, new RegExp(`href="${appStoreUrl}"`, 'i'), 'hero should link directly to the App Store listing');
assert.match(index, /images\/app-store-badge\.svg/i, 'hero should use the local App Store badge asset');
assert.match(index, /heroDownloadKicker/i, 'hero download copy key should exist above the fold');
assert.match(index, /mobile-sticky-cta[^>]+data-cta-placement="mobile_sticky"/i, 'mobile sticky CTA should remain tracked');
assert.match(index, /data-i18n-html="price_pro_f2"[^>]*><strong>AI agent<\/strong>/i, 'homepage should render the AI agent emphasis as HTML');
assert.match(index, /data-i18n-html="price_pro_f3"[^>]*><strong>Duo Zoeken<\/strong>/i, 'homepage should render the Duo Search emphasis as HTML');
assert.doesNotMatch(index, /data-i18n="price_pro_f[23]"/i, 'homepage should not render Pro benefit markup as plain text');
assert.match(searchable, /Download in de App Store/i, 'Dutch App Store CTA should exist');
assert.match(searchable, /Download on the App Store/i, 'English App Store CTA should exist');
assert.match(script, /initMobileStickyCtaVisibility/i, 'sticky CTA visibility controller should exist');
assert.match(script, /querySelector\('\.hero-download-card'\)/i, 'sticky CTA visibility should use the hero download card as its trigger');
assert.match(script, /IntersectionObserver/i, 'sticky CTA visibility should use IntersectionObserver');
assert.match(script, /triggerRect\.bottom\s*<=\s*0[\s\S]*is-visible/i, 'sticky CTA should appear only after the hero download card scrolls out above the viewport');
assert.match(styles, /\.mobile-sticky-cta\s*\{[\s\S]*display:\s*none[\s\S]*\.mobile-sticky-cta\.is-visible\s*\{[\s\S]*display:\s*inline-flex/i, 'sticky CTA should be hidden by default and shown only via visibility class');
assert.match(styles, /body\s*\{\s*padding-bottom:\s*104px;/i, 'mobile layout should reserve bottom padding for sticky CTA');

assert.doesNotMatch(searchable, /countdown|aftellen|remaining spots|spots left|plekken over|nog \d+ plekken/i, 'no fake countdown or fake remaining-spots copy');
assert.doesNotMatch(index, /waitlist-form|waitlist-hero|waitlist-footer|wachtlijst|waitlist|eerste 100|first 100|pre-launch|early access/i, 'home should no longer use waitlist or pre-launch copy');
assert.doesNotMatch(publicHtml, /Google Play|Downloaden op Google Play/i, 'public Google Play CTA copy should not be introduced');

console.log('static landing copy smoke passed');
