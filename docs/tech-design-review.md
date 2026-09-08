> Actuele revisie: zie [content-brand-review.md](content-brand-review.md) voor herstelde productiecontent en het palet uit de app. De navy-/raspberrybeschrijving hieronder documenteert de eerdere ontwerpversie.

# Visuele review — Nestd techrichtingen

De goedgekeurde conceptrichting is uitgewerkt in drie afzonderlijke branches vanaf `origin/main`:

- **A — Direct** (`codex/landing-alerts-direct`): gecentreerde hero met een breed productbeeld waarin woningaanbod en melding samenkomen.
- **B — De melding** (`codex/landing-alerts-notification`): hero in twee kolommen met telefoon en woningmelding, gebaseerd op de goedgekeurde mock-up.
- **C — Ruimte voor thuis** (`codex/landing-alerts-human`): donkerblauwe hero met fotografie en een framboosrode sectie voor de zoekfilters.

Alle uitvoeringen gebruiken het echte, ongewijzigde `logo.png`. De herkomst en de witte tegel die onderdeel is van het logo staan in [brand-assets.md](brand-assets.md).

Nestd wordt gepresenteerd als beschikbare iPhone-app voor snelle meldingen over nieuwe huurwoningen binnen ingestelde zoekfilters. De downloadknoppen verwijzen naar [Nestd in de App Store](https://apps.apple.com/nl/app/nestd/id6761392857). De marketing bevat geen wachtlijst of AI-functies. Woninggegevens in de productbeelden zijn herkenbaar als illustratieve voorbeelden.

## Beeldmateriaal

`images/tech-facade.webp` is een gegenereerde, illustratieve gevelafbeelding van 1024 × 1365 pixels (253.116 bytes). Het beeld toont een gewone Nederlandse bakstenen gevel met hoge donkere ramen en groen bij daglicht, zonder mensen, tekst, logo, adres of interface. Het dient als sfeerbeeld en presenteert geen beschikbaar woningaanbod.

## Verificatie

De browsercontrole omvatte 24 combinaties: drie varianten, Nederlands en Engels, en viewports van 320 × 568, 390 × 844, 768 × 1024 en 1440 × 900. In deze controles bleef de primaire downloadactie boven de vouw, was er geen horizontale overflow en werden de afbeeldingen correct geladen.

Per variant slagen alle 20 gedragstests en de statische landingcontrole. Deze dekken onder meer taalwissels, downloadacties, attributiebehoud en het weren van e-mailadressen en zoekvoorkeuren uit analytics-events.

## Nog nodig

De concepten zijn goedgekeurd; de daadwerkelijke uitvoeringen worden nu ter visuele review aangeboden. De branches zijn nog niet gepusht. Na goedkeuring van deze visuele review kunnen de drie branches worden gepusht voor afzonderlijke Vercel Previews.

## Generation record

Mode: built-in `image_gen` tool. Final project asset: `images/tech-facade.webp` in each of the three worktrees. The PNG was encoded and resized to WebP using cwebp, with no change to the logo.

Final prompt:

Use case: photorealistic-natural. Asset type: photographic hero background for Nestd, a Dutch rental-alert app. Generate ONLY a beautiful realistic architectural photograph, NO UI, no phones, no typography, no logos. Vertical portrait composition approximately 3:4. A close view of an ordinary elegant lived-in Dutch brick townhouse facade in Utrecht: one tall dark-painted wooden sash window, authentic warm red-brown brickwork, cream stone lintel and sill, a little green climbing foliage and restrained potted plants. Midday soft natural sunshine, tactile materials, subtly reflected neighboring Dutch architecture in the glass. Contemporary high-end architectural photography with natural color and real detail. The window occupies the right two-thirds of the image; brick and some foliage at left allow cropping. The home is believable rental housing, not a mansion or a luxury property ad. Eye-level perspective, controlled straight verticals, lightly angled view for depth, one facade fragment rather than street panorama. Warm, human and photographic, not generative illustration. A slight interior glimpse through glass is fine, no identifiable people. No house number, no signs, no address, no phone, no notification, no screenshot, no border, no foreground objects. This is an illustrative atmosphere photo, not a real available listing. Output a high-quality finished photograph ready for an image asset.
