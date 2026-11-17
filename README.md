# SNX Snack Rush

Mobiele endless runner voor SNX (snxfood.com) die consumentenleads oplevert. Eén bestand: `index.html`.

## Spel
- Swipe links/rechts: wissel van baan. Ontwijk de SNX-trucks.
- Swipe omhoog of tik: spring over appels en kiosken.
- Swipe omlaag: rol (plet appels) of val snel naar beneden.
- Vang SNX Betterballen (+10), K-Rockets (+25) en BOB Burgers (+50).
- 25 snacks = Turbo (onkwetsbaar, sneller, punten ×2).
- Verzenddoos Betterballen = power-up: +100 en 8 seconden dubbele punten.

## SNX Snack Blaster (`bubble.html`)
Bubble shooter met SNX-snacks. Eén bestand, gebruikt dezelfde `assets/`.
- Sleep om te mikken, laat los om te schieten. 3+ dezelfde snacks (Betterbal, K-Rocket, BOB Burger, ChickenBite) knallen weg.
- Snacks die los komen te hangen vallen: dubbele punten.
- 8+ in één schot = Verzenddoos als volgende schot: blaast alles in de buurt weg.
- Elke paar missers schuift er een nieuwe rij in. Snacks over de stippellijn = game over. Bord leeg = volgend level (+500 × level).
- Record wordt lokaal bewaard. Nog geen koppeling met leads/ranglijst.
## SNX Power Slot (`slot.html`)
Tweede game: 5 rollen, 243 manieren om te winnen, SNX-snacks als symbolen. Gratis snack-punten, geen geld, geen prijzen.
- **SNX Wild** (rol 2-5) vervangt elke snack. **Snack Truck** dropt soms 2-5 extra wilds.
- **Doos-bonus**: 3+ Bonus-dozen in één spin, of 30 verzameld op de meter. Kast schudt, flits, dan twee interactieve stappen:
  1. **Kies je doos** (1 van 3): Wild-regen (3-5 extra wilds per spin), Wild-rij (hele rij wild per spin) of Plak-wilds (wilds blijven staan).
  2. **Stop de teller**: 4 tot 10 booster free spins.
- **Booster free spins** spelen vanzelf, met een **extra rij** (4 rijen, 1.024 manieren). 3+ dozen = +3 spins.
- **Bitterbal-fontein** bij winst vanaf 15x de inzet (groter bij 50x en 100x).
- Gesimuleerd (400k spins): ~98% terugbetaling, Doos-bonus ~1 op 62 spins, gemiddeld ~41x inzet per bonus, fontein bij ~85% van de bonussen.
- Testen: `slot.html?bonus=1` start direct de Doos-bonus, `?feature=row|rain|sticky` direct de free spins met die booster, `?fountain=1` de fontein.

## Leads en ranglijst
- Na een ronde: voornaam, e-mail, schermnaam. Verplicht: akkoord met de actievoorwaarden en privacy.
  Vrijwillig (los vinkje): SNX-nieuws en acties. Alleen wie dat aanvinkt, gaat naar ActiveCampaign.
- Fase 1 (nu): spelers verzamelen. Nog geen prijs of kortingscode in de game; spelregels en beloning volgen later.
- Backend: Supabase-project `snx-snack-rush` (eu-central-1), Edge Function `snack-rush`
  (`GET` = top 10 van dit jaar, `POST` = score + lead). Scores worden op de server op plausibiliteit gecontroleerd.
- Leads gaan naar ActiveCampaign-lijst **Snack Rush** (id 39) met tag `game-snack-rush` (id 219), zodra
  de secrets `AC_API_URL` en `AC_API_KEY` in Supabase zijn ingesteld. Tot dan blijven ze in de tabel `leads` met `ac_synced = false`.

## Backend-bron
`supabase/functions/snack-rush/index.ts` en `supabase/migrations/` (de migratie van 8 nov moet vóór de nieuwe functie draaien).

## SNX Club Cup (`clubcup.html`)
Tweede game: drie korte sporten als één toernooi, met een spelers- én een clubklassement. Doel: consumentenleads
plus een lijst sportclubs (padel, tennis, golf, voetbal) als ingang voor foodservice-verkoop in hun kantines.

- **Padel** (45 s, 3 levens): tik als de bal in je ring zit, swipe links/rechts om te mikken. Mis je hem, dan kaatst
  het glas achter je hem terug voor een tweede kans (+15). Terugslag +10, winner +50 (+5 per slag in de rally).
- **Golf** (3 holes): sleep terug en laat los. Hole in one 300, birdie 180, par 110, daarna 60/30. Zand remt, pijlen = helling.
- **Penalty** (6 schoten): swipe omhoog. Richting = hoek, lengte = hoogte. Goal 100, kruising +50. De keeper leest je steeds beter.
- Snacks: Betterbal +10, K-Rocket +25 (bij padel ook een smash), BOB Burger +50.
- Na het toernooi: voornaam, e-mail, schermnaam en **sportclub**. Clubs met andere hoofdletters of spaties tellen als één club.
  Clubklassement: meeste spelers bovenaan, bij gelijkspel de som van hun beste scores.
- Backend (nog niet live): migratie `supabase/migrations/20261117_club_cup.sql`, daarna Edge Function `club-cup`
  (deploy met `verify_jwt = false`, net als `snack-rush`). Gebruikt dezelfde tabel `leads`.
  ActiveCampaign: lijst `AC_CLUBCUP_LIST_ID` (standaard 39); maak tag `game-club-cup` aan en zet de id in `AC_CLUBCUP_TAG_ID`.
  Tot de backend live is, toont de game "ranglijst niet bereikbaar"; spelen werkt wel.
- Fase 1: geen prijs in de game. Wil je de kantinepakket-actie voor de winnende club, zet die dan eerst in de actievoorwaarden (punt 4).

## Web-app (iPhone, Samsung, Android)
`manifest.webmanifest`, `sw.js` en `icons/` maken van de game een installeerbare web-app: spelers openen de link in hun
browser en kunnen hem op het beginscherm zetten (Android: knop in het startscherm; iPhone: Safari > Deel > Zet op beginscherm).
Na het eerste bezoek werkt het spel ook offline; de ranglijst heeft internet nodig.

## SNX Snack Match (`match.html`)
Tweede game: eigen match-3 puzzel met de SNX-producten als tegels (Betterbal, BOB Burger, K-Rocket, Doos, SNX-logo).
- Swipe of tik twee buren om te wisselen. 3 op een rij = weg.
- 4 op een rij = Turbo-snack (ruimt rij of kolom). L/T-vorm = Frituurbom. 5 op een rij = SNX Mega (wist een hele soort).
- 30 levels met doel (X van een product verzamelen + puntendoel) en beperkt aantal zetten; 1-3 sterren.
- Voortgang staat lokaal in de browser (localStorage). Nog geen leadformulier of ranglijst gekoppeld.
## SNX Derby (paardenrace)
`paardenrace.html`: wedden op 7 SNX-paarden (Betterbal Bliksem, K-Rocket, BOB Burger, Verzenddoos Express, Chickenbites Champ, Now You Can, Have It All),
zoals in een Engels wedkantoor: fractional odds (5/2, EVS), Win of Each-way (1/4 odds, plaats 1-2), vaste prijs bij inzet,
koersen bewegen tot de start. Speelgeld (SNX-munten, start 1000, saldo blijft in de browser). Namen staan bovenaan in `HORSES`.
Talen: NL, EN en Arabisch (rechts-naar-links). Speler kiest zelf; vaste taal via de link: `paardenrace.html?lang=en` of `?lang=ar`.
Na publicatie: `https://<github-pages-url>/paardenrace.html`.

## Online zetten
GitHub Pages via `.github/workflows/pages.yml` (bij push naar `main`). Daarna met een iframe op snxfood.com/game:

```html
<iframe src="https://<github-pages-url>/" style="width:100%;height:100vh;border:0" allow="autoplay" title="SNX Snack Rush"></iframe>
```

Huisstijl: SNX-Visueel-Bronbestand (hoogste versie in Drive).

## SNXbar Tycoon (`snxbar.html`)
Tweede game: een farming-sim-achtige tycoon waarin je één SNXbar uitbouwt tot een Europese keten.
- Dagritme 06:00–02:00, bar open 10:00–21:00, seizoenen van 10 dagen, weer en festivals.
- Bakken aan de friteuse, porties pakken, klanten aan de toonbank serveren (geduldbalk, fooi, reputatie).
- Groothandelskrat bij de deur: restporties worden 's nachts verkocht (60%). Dagelijkse B2B-opdrachten op het bord.
- Groothandel: voorraad en koffie. Kantoor: upgrades, menukaart (K-Rocket, BOB Burger), personeel, 12 filialen in Europa.
- Opslaan in de browser (localStorage). Online op `<github-pages-url>/snxbar.html`.
