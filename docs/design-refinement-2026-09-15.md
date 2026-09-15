# Kortere homepage, meldingsdemo en reviewopmaak — 15 september 2026

De homepage herhaalde filters, meldingen en zelf reageren in meerdere secties. Deze revisie verkort die uitleg en laat het productbeeld meer werk doen. De drie bestaande ontwerpen en de appbranding blijven behouden. B blijft de aanbevolen richting: duidelijke belofte, concreet telefoonbeeld en een korte mobiele downloadroute. C is de sfeervollere optie; A legt nadruk op een breed productbeeld.

## Veranderingen

- Kortere hero-tekst en productuitleg. De extra reactie-sectie in B is geschrapt. De drie stappen blijven staan.
- Eén alinea over Nestd op de homepage, met links naar het volledige verhaal en privacybeleid. Over Nestd, contactformulier, privacy en de volledige prijspagina zijn inhoudelijk ongewijzigd.
- De Nederlandse hoofdinhoud telt nu 368 in plaats van 450 woorden in A (-18%), 312 in plaats van 436 in B (-28%) en 375 in plaats van 536 in C (-30%). Geteld als de zichtbare standaardtekst binnen main, inclusief FAQ-antwoorden en nieuwe placeholders, exclusief HTML-attributen en comments.
- Eén meldingsanimatie wanneer het voorbeeld in beeld komt. Het replay-icoon speelt die opnieuw af; geen loop of scrollanimaties per sectie. Geen layoutverschuiving, extra netwerkverzoeken, opslag of analytics-events. Reduced motion stopt de beweging en toont het stilstaande voorbeeld.
- Drie reviewplaatsen tussen productuitleg en prijzen. Iedere plaats is zichtbaar gemarkeerd als Placeholder en bevat uitsluitend een onderwerp en [Naam]. Geen verzonnen citaten, personen, sterren of ratings.

## Reviews later invullen

De uiteindelijke inhoud staat in index.html van iedere variant, in de sectie met id ervaringen. De referentieopmaak staat in [fragments/reviews.html](fragments/reviews.html); dit is geen runtime-template. Vervang het onderwerp en de naam door een echte aangeleverde review en houd de NL/EN-attributen en standaard Nederlandse tekst gelijk. Verwijder de Placeholder-markering bij die review. De toelichting bovenaan kan weg zodra alle getoonde reviews echt zijn.

## Verificatie en status

Per variant slagen 35 gedragstests en de statische contentcontrole. De acht nieuwe motiontests controleren onder meer onderbreekbare replay, reduced motion tijdens gebruik, ontbrekende API’s en behoud van het productbeeld. Onafhankelijke HTML-review bevestigt de structuur, vertalingen, focusbare replay en ongewijzigde analytics.

Browsercontrole: A/B/C in NL/EN op 320×568, 390×844, 768×1024 en 1440×900 (24 combinaties). De downloadactie past boven de vouw, de reviewlabels zijn vertaald en afbeeldingen laden. De replay is daadwerkelijk afgespeeld; toetsenbordfocus heeft een zichtbare contrastrijke rand. De visuele controle omvat desktop- en mobiele reviewopmaak en hero’s. Abonnement blijft Nestd Pro €15 per maand, alle functies inbegrepen.

Lokaal ter review; niet gepusht of gepubliceerd.
