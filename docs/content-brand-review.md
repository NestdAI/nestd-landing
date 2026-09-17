> Voor de latere inkorting, meldingsdemo en reviewplaceholders: [design-refinement-2026-09-15.md](design-refinement-2026-09-15.md).

# Content en merkpalet — 8 september 2026

Deze revisie volgt op de goedkeuring van de drie techontwerpen. De gebruiker vroeg de relevante productiecontent te herstellen en de merkkleuren op de app te baseren.

## Bronnen en wijzigingen

- Live productie: https://www.nestd.nl/, /pricing.html, /about.html en /privacy.html, gecontroleerd op 8 september 2026. Repositorybasis blijft origin/main f09f8ea; main is ongewijzigd.
- Prijzen en Over Nestd zijn terug in de hoofd- en mobiele navigatie, op de homepage en als volledige ondersteunende pagina's.
- Definitieve prijskeuze van de gebruiker: **één abonnement, Nestd Pro voor €14,99 per maand; alle functies inbegrepen** (prijscorrectie van 17 september 2026). Deze expliciete correctie vervangt de eerdere websiteprijzen en de eerder afgeleide Gratis/Pro-verdeling uit de appbron. Er is geen gratis productlaag.
- Alle drie homepages, Over Nestd, de volledige prijspagina, FAQ en downloadteksten communiceren dit in NL en EN. Inbegrepen: woningen bekijken en opslaan, zoekfilters op stad/budget/kamers/oppervlakte, pushmeldingen en WhatsApp-meldingen. Geen proefperiode of onbevestigde voorwaarden toegevoegd. Deze wijziging betreft de website; billing in de app is niet gewijzigd.
- Over Nestd: eigen zoekfrustratie, toegankelijk/betaalbaar zoeken, studenten/starters/expats, Amsterdam en hello@nestd.nl. Geen verzonnen gebruikersverhalen of ongeverifieerde woningmarktstatistieken.
- Contactformulier: bestaand JSON-contract naar de bestaande contact-form Edge Function, naam/e-mail/bericht. HEAD/OPTIONS en CORS gecontroleerd; geen echt bericht verstuurd. Gebruikersinvoer wordt alleen bij succes gewist, niet bij fouten. Geen formulierdata in analytics, browseropslag, logs of URL's.
- Privacybeleid, contactgegevens Muba B.V. en privacy@nestd.nl behouden; contactgegevens/verwerkingsdoel toegevoegd en werkend cookiesanker gemaakt. Appvoorwaarden verwijzen naar de Apple EULA die op de bestaande App Store-pagina staat. Oude dode algemene voorwaarden-/cookielinks zijn niet teruggezet.
- Alle oude AI-, chat-, swipe/duo-, wachtlijst- en proefperiodepromoties blijven uit de marketing. Historische wachtlijstverwerking blijft in het privacybeleid beschreven.

## Appkleuren

Bron: app/theme/tokens.ts en app/tailwind.config.js in /Users/hichamsadike/nestdAI/nestd, identiek op lokale main en origin/main tijdens deze controle.

| Rol                                    | Kleur   |
| -------------------------------------- | ------- |
| Merkpink / grote accenten              | #FF385C |
| Achtergrond                            | #FFFFFF |
| Tekst / contrasterende donkere secties | #222222 |
| Subtekst                               | #717171 |
| Zachte achtergrond                     | #F7F7F7 |
| Randen                                 | #DDDDDD |
| Lichtroze                              | #FFF1F3 |
| Toegankelijke knop met witte tekst     | #C80D36 |

De knopkleur is primary700 uit de app en heeft circa 5,89:1 contrast met wit. Het navy en zelfgekozen raspberrypalet zijn vervangen. De goedgekeurde Archivo-typografie en drie verschillende composities blijven behouden. Het oorspronkelijke logo.png is ongewijzigd.

## Controles en status

Alle drie varianten: 27 gedragstests (20 marketing/taal/navigatie + 7 contactformulier), statische content-/linkcontrole en git diff --check slagen. De bestaande pricing_section_viewed is hersteld zonder nieuwe persoonsgegevens.

De browsercontrole van deze revisie omvat 48 combinaties: de drie homepages en de gedeelde prijzen-, Over ons- en privacypagina, telkens NL/EN op 320×568, 390×844, 768×1024 en 1440×900. Geen horizontale overflow of ontbrekende vertalingen; de primaire downloadknoppen blijven in beeld. Mobiel menu naar Prijzen, NL→EN en de lege-contactformulier-validatie zijn in de echte browser gecontroleerd. Geen echt contactbericht verstuurd. De kleine tekst in het Pro-paneel rendert als #222222; donkere secties hebben een zichtbare witte focusrand. Geen push of deployment uitgevoerd.

## Prijscorrectie: alleen Pro

Na de expliciete prijscorrectie zijn 30 browsercombinaties opnieuw gecontroleerd: drie homepages, Prijzen en Over Nestd in NL/EN op 320×568, 390×844 en 1440×900. Alle tonen €15 per maand, zonder oude gratisclaims, vertaalverschillen of horizontale overflow. Alle primaire hero-downloadknoppen passen binnen deze viewports. Het enkele prijspaneel is visueel bekeken op desktop en mobiel; 27 gedragstests per variant en de aangescherpte statische prijs-/contentcontrole slagen. Code-review bevestigt behoud van het volledige verhaal en contactformulier. Alleen lokale preview; geen push/deployment.

## Prijscorrectie — 17 september 2026

De gebruiker heeft het bedrag aangepast naar €14,99 per maand. Nederlandse tekst gebruikt €14,99; Engels gebruikt €14.99. Homepages, prijzen, Over Nestd, downloadteksten en metadata zijn bijgewerkt. De eerdere verificaties hierboven beschrijven de toenmalige prijs. Het blijft één Pro-abonnement met alle functies inbegrepen. Deze wijziging betreft uitsluitend de landingspagina’s.
