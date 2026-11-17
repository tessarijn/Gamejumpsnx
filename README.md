# SNX Snack Rush

Mobiele endless runner voor SNX (snxfood.com) die consumentenleads oplevert. Eén bestand: `index.html`.

## Spel
- Swipe links/rechts: wissel van baan. Ontwijk de SNX-trucks.
- Swipe omhoog of tik: spring over appels en kiosken.
- Swipe omlaag: rol (plet appels) of val snel naar beneden.
- Vang SNX Betterballen (+10), K-Rockets (+25) en BOB Burgers (+50).
- 25 snacks = Turbo (onkwetsbaar, sneller, punten ×2).
- Verzenddoos Betterballen = power-up: +100 en 8 seconden dubbele punten.

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

## Online zetten
GitHub Pages via `.github/workflows/pages.yml` (bij push naar `main`). Daarna met een iframe op snxfood.com/game:

```html
<iframe src="https://<github-pages-url>/" style="width:100%;height:100vh;border:0" allow="autoplay" title="SNX Snack Rush"></iframe>
```

Huisstijl: SNX-Visueel-Bronbestand (hoogste versie in Drive).
