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

## SNXbar Tycoon (`snxbar.html`)
Tweede game: een farming-sim-achtige tycoon waarin je één SNXbar uitbouwt tot een Europese keten.
- Dagritme 06:00–02:00, bar open 10:00–21:00, seizoenen van 10 dagen, weer en festivals.
- Bakken aan de friteuse, porties pakken, klanten aan de toonbank serveren (geduldbalk, fooi, reputatie).
- Groothandelskrat bij de deur: restporties worden 's nachts verkocht (60%). Dagelijkse B2B-opdrachten op het bord.
- Groothandel: voorraad en koffie. Kantoor: upgrades, menukaart (K-Rocket, BOB Burger), personeel, 12 filialen in Europa.
- Opslaan in de browser (localStorage). Online op `<github-pages-url>/snxbar.html`.
