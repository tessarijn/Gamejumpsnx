# SNX Snack Rush

Mobiele endless runner voor SNX (snxfood.com) die consumentenleads oplevert. Eén bestand: `index.html`.

## Spel
- Swipe links/rechts: wissel van baan. Ontwijk de SNX-trucks.
- Swipe omhoog of tik: spring over appels en kiosken.
- Swipe omlaag: rol (plet appels) of val snel naar beneden.
- Vang SNX Betterballen (+10), K-Rockets (+25) en BOB Burgers (+50).
- 25 snacks = Turbo (onkwetsbaar, sneller, punten ×2).
- Verzenddoos Betterballen = power-up: +100 en 8 seconden dubbele punten.

## SNX Power Slot (`slot.html`)
Tweede game: 5 rollen, 243 manieren om te winnen, SNX-snacks als symbolen. Gratis snack-punten, geen geld, geen prijzen.
- **SNX Wild** (rol 2-5) vervangt elke snack. **Snack Truck** dropt soms 2-5 extra wilds.
- **Doos-bonus**: 3+ Bonus-dozen in één spin, of 25 verzameld op de meter. Speler kiest 3 van 6 verzenddozen;
  die geven extra free spins, een hogere start-multiplier of nog een rij.
- **Booster free spins**: basis 5 spins met een **extra rij** (4 rijen, 1.024 manieren), met de rij-doos 5 rijen (3.125 manieren).
  Multiplier +1 per winst (max x10), 3+ dozen = +5 spins.
- **Bitterbal-fontein** bij winst vanaf 15x de inzet (groter bij 50x en 100x).
- Gesimuleerd (500k spins): ~98% terugbetaling, Doos-bonus ~1 op 54 spins, gemiddeld ~18x inzet per bonus.
- Testen: `slot.html?bonus=1` start direct de Doos-bonus, `slot.html?fountain=1` toont de fontein.

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
