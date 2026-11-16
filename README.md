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
