// SNX ranglijst: gedeeld formulier + top 10 voor Snack Match en Snack Blaster.
// Gebruik: SNXRanglijst.init({ game: 'match', titel: 'Snack Match' }); SNXRanglijst.score({ score, duration });
(function () {
  const API = 'https://kzauqjavoaphzxnvmbua.supabase.co/functions/v1/snx-arcade';
  const KEY = 'snx_rush_player'; // zelfde speler als in Snack Rush: wie daar al meedoet, hoeft niets opnieuw in te vullen
  const TERMS = "<p><b>1. Organisator.</b> SNX Snack Rush is een spel van SNX B.V., Groenekanseweg 70, 3732 AG De Bilt, KvK 98692224 (hierna: SNX).</p>\n      <p><b>2. Meedoen.</b> Meedoen is gratis en staat open voor iedereen. Ben je jonger dan 16, dan speel je mee met toestemming van je ouder of verzorger. Je doet mee door een score in te sturen en akkoord te gaan met deze voorwaarden. Per persoon één e-mailadres; meerdere accounts per persoon zijn niet toegestaan. Medewerkers van SNX en hun gezinsleden dingen niet mee naar prijzen.</p>\n      <p><b>3. Ranglijst.</b> De ranglijst loopt per kalenderjaar. Per deelnemer telt de hoogste score. Op de ranglijst staat alleen je schermnaam. SNX mag een schermnaam die beledigend is, een merk of andermans naam bevat, aanpassen of verwijderen.</p>\n      <p><b>4. Prijzen.</b> De games zijn behendigheidsspellen: de hoogste score wint, er wordt niet geloot. SNX kan prijzen koppelen aan de ranglijst. Welke prijs, voor welke periode en voor hoeveel winnaars maakt SNX vooraf bekend in het spel of op snxfood.com/world. Een prijs is persoonlijk, niet overdraagbaar en niet inwisselbaar voor geld. Is de winnaar jonger dan 16, dan reiken we de prijs uit via een ouder of verzorger. Winnaars krijgen bericht per e-mail en reageren binnen 14 dagen; daarna vervalt de prijs. Eventuele belasting over een prijs betaalt SNX.</p>\n      <p><b>5. Eerlijk spel.</b> Valsspelen is niet toegestaan. Wie hacks, scripts, bots of andere hulpmiddelen gebruikt, scores of het spel manipuleert, of met meerdere accounts speelt, wordt zonder bericht uitgesloten van deelname en van prijzen. SNX controleert winnende scores en verwijdert scores die technisch niet mogelijk zijn of niet eerlijk zijn behaald.</p>\n      <p><b>6. Uitslag.</b> Over de uitslag wordt niet gecorrespondeerd. Klachten over de actie kun je mailen naar orders@snxfood.com.</p>\n      <p><b>7. Aansprakelijkheid en wijzigingen.</b> SNX is niet aansprakelijk voor storingen, verloren scores of technische fouten in het spel. SNX mag de actie en deze voorwaarden op elk moment wijzigen of beëindigen.</p>\n      <p><b>8. Privacy.</b> Voor de ranglijst en om winnaars te bereiken bewaren we je voornaam, e-mailadres, schermnaam en scores. Alleen als je daar apart voor kiest en 16 jaar of ouder bent, sturen we je ook SNX-nieuws en acties; afmelden kan via elke mail. We bewaren je gegevens zolang je speelt en verwijderen ze als je drie jaar geen nieuwe score instuurt, op servers in de EU. Inzage of verwijderen kan via orders@snxfood.com.</p>\n      <p><b>9. Recht.</b> Op deze actie is Nederlands recht van toepassing.</p>";
  const ERR = {
    terms_required: 'Ga akkoord met de actievoorwaarden om mee te doen.',
    invalid_email: 'Dat e-mailadres klopt niet. Kijk het even na.',
    invalid_nickname: 'Je naam op de ranglijst moet 2 tot 16 tekens zijn: letters, cijfers, spatie, punt of streepje.',
    implausible_score: 'Deze score kunnen we niet controleren, dus hij telt niet mee.',
    too_fast: 'Even rustig: wacht een paar seconden en probeer het opnieuw.',
  };
  const CSS = `
  .snxr-btn{display:inline-block;margin-top:8px;font:800 15px 'Poppins',sans-serif;letter-spacing:.04em;color:#fff;background:#111;border:0;border-radius:999px;padding:9px 16px;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.35)}
  .snxr-btn:hover{background:#ff2625}
  .snxr-wrap{position:fixed;inset:0;z-index:9999;background:rgba(17,17,17,.6);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:max(16px,env(safe-area-inset-top)) 12px 24px}
  .snxr-wrap[hidden]{display:none}
  .snxr{position:relative;width:min(420px,100%);background:#ff2625;color:#111;border:3px solid #111;border-radius:20px;padding:16px;display:grid;gap:10px;font-family:'Poppins',Arial,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.4)}
  .snxr h2{margin:0;color:#fff;font:800 24px 'Poppins',sans-serif;text-transform:uppercase;text-shadow:0 2px 0 #111}
  .snxr .snxr-x{position:absolute;top:8px;right:10px;background:#111;color:#fff;border:0;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer}
  .snxr .snxr-box{background:#fff;border:2px solid #111;border-radius:14px;padding:12px;display:grid;gap:8px;text-align:left}
  .snxr .snxr-box h3{margin:0;font-weight:800;font-size:16px;text-transform:uppercase;color:#d12325}
  .snxr p{margin:0;font-size:14px;font-weight:500}
  .snxr label{display:grid;gap:2px;font-size:13px;font-weight:600}
  .snxr input[type=text],.snxr input[type=email]{font:500 16px 'Poppins',sans-serif;padding:8px 10px;border:2px solid #111;border-radius:10px}
  .snxr .snxr-check{display:flex;gap:8px;align-items:flex-start;font-size:13px;font-weight:500;line-height:1.35}
  .snxr .snxr-check input{width:20px;height:20px;flex:none;accent-color:#ff2625;margin:0}
  .snxr .snxr-check a{color:#d12325;font-weight:700}
  .snxr .snxr-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
  .snxr .snxr-go{font:800 16px 'Poppins',sans-serif;color:#fff;background:#ff2625;border:2px solid #111;border-radius:12px;padding:9px;cursor:pointer;box-shadow:0 4px 0 #111}
  .snxr .snxr-go:disabled{opacity:.6}
  .snxr .snxr-msg{font-size:15px;font-weight:600;background:#fff;border:2px solid #111;border-radius:12px;padding:8px 10px}
  .snxr .snxr-msg.err{color:#d12325}
  .snxr .snxr-board h3{margin:0;color:#fff;font-weight:800;font-size:18px;text-transform:uppercase;text-shadow:0 2px 0 #111}
  .snxr ol{margin:4px 0 0;padding:0;list-style:none;display:grid;gap:3px;font-variant-numeric:tabular-nums}
  .snxr li{display:flex;gap:8px;font-size:14px;font-weight:600;padding:4px 8px;border-radius:8px;background:#fff}
  .snxr li b{width:22px;color:#d12325}
  .snxr li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .snxr li.me{background:#111;color:#fff}
  .snxr li.empty{justify-content:center;font-weight:500}
  .snxr details{background:#fff;border:2px solid #111;border-radius:12px;padding:8px 10px;font-size:12px;text-align:left}
  .snxr details summary{cursor:pointer;font-weight:700}
  .snxr details p{font-size:12px;margin:6px 0 0}
  .snxr-toast{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9998;background:#111;color:#fff;font:600 14px 'Poppins',sans-serif;border-radius:999px;padding:10px 16px;box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:92vw;text-align:center}`;
  let cfg = { game: '', titel: '' }, player = null, last = null, root = null;
  try { player = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { player = null; }
  const $ = (s) => root.querySelector(s);
  function build() {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.className = 'snxr-wrap'; root.hidden = true;
    root.innerHTML = `<div class="snxr" role="dialog" aria-modal="true" aria-labelledby="snxrT">
      <button class="snxr-x" type="button" aria-label="Sluiten">×</button>
      <h2 id="snxrT">Ranglijst</h2>
      <div class="snxr-box" data-form>
        <h3>Zet je naam op de ranglijst</h3>
        <p>Je score: <b data-score>0</b>. Laat je gegevens achter en speel mee voor de ranglijst van dit jaar.</p>
        <form novalidate style="display:grid;gap:8px">
          <label>Voornaam<input name="voornaam" type="text" autocomplete="given-name" maxlength="60"></label>
          <label>E-mailadres<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
          <label>Naam op de ranglijst<input name="nick" type="text" maxlength="16" placeholder="2 tot 16 tekens" required></label>
          <div class="snxr-hp" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
          <label class="snxr-check"><input name="terms" type="checkbox" required><span>Ik ga akkoord met de <a href="#" data-terms>actievoorwaarden en privacy</a>.</span></label>
          <label class="snxr-check"><input name="marketing" type="checkbox"><span>Ja, stuur mij ook SNX-nieuws en acties (niet verplicht, vanaf 16 jaar). Afmelden kan altijd.</span></label>
          <button class="snxr-go" type="submit">ZET ME OP DE LIJST</button>
        </form>
      </div>
      <p class="snxr-msg" hidden></p>
      <div class="snxr-board"><h3>Top 10 van ${new Date().getFullYear()}</h3><ol><li class="empty">Ranglijst laden…</li></ol></div>
      <details><summary>Actievoorwaarden en privacy</summary>${TERMS}</details>
    </div>`;
    document.body.appendChild(root);
    $('.snxr-x').addEventListener('click', close);
    root.addEventListener('click', (e) => { if (e.target === root) close(); });
    $('[data-terms]').addEventListener('click', (e) => { e.preventDefault(); const d = root.querySelector('details'); d.open = true; d.scrollIntoView({ behavior: 'smooth' }); });
    $('form').addEventListener('submit', onSubmit);
  }
  function msg(t, err) { const m = $('.snxr-msg'); m.textContent = t || ''; m.classList.toggle('err', !!err); m.hidden = !t; }
  function close() { root.hidden = true; }
  async function board() {
    const ol = $('ol');
    try {
      const r = await fetch(API + '?game=' + encodeURIComponent(cfg.game)); const d = await r.json();
      ol.textContent = '';
      if (!d.top || !d.top.length) { ol.innerHTML = '<li class="empty">Nog niemand op de lijst. Jij kunt de eerste zijn.</li>'; return; }
      for (const row of d.top) {
        const li = document.createElement('li'); if (player && row.nickname === player.nickname) li.className = 'me';
        const b = document.createElement('b'); b.textContent = row.rank;
        const n = document.createElement('span'); n.textContent = row.nickname;
        const s = document.createElement('strong'); s.textContent = row.score;
        li.append(b, n, s); ol.appendChild(li);
      }
    } catch (e) { ol.innerHTML = '<li class="empty">De ranglijst is nu niet bereikbaar.</li>'; }
  }
  async function send(p) {
    const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ game: cfg.game, terms: true }, p, last)) });
    let d = null; try { d = await r.json(); } catch (e) {}
    if (!r.ok || !d || !d.ok) throw new Error((d && d.error) || 'submit_failed');
    return d;
  }
  function toast(t) {
    const el = document.createElement('div'); el.className = 'snxr-toast'; el.textContent = t;
    document.body.appendChild(el); setTimeout(() => el.remove(), 4500);
  }
  async function onSubmit(e) {
    e.preventDefault();
    const f = e.target, p = { voornaam: f.voornaam.value.trim(), email: f.email.value.trim(), nickname: f.nick.value.trim(),
      terms: f.terms.checked, marketing: f.marketing.checked, website: f.website.value };
    if (!p.terms) return msg(ERR.terms_required, true);
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(p.email)) { f.email.focus(); return msg(ERR.invalid_email, true); }
    if (!/^[A-Za-z0-9 _.\-]{2,16}$/.test(p.nickname)) { f.nick.focus(); return msg(ERR.invalid_nickname, true); }
    const btn = f.querySelector('button'); btn.disabled = true; msg('Versturen…');
    try {
      const d = await send(p);
      player = { voornaam: p.voornaam, email: p.email, nickname: p.nickname, marketing: p.marketing };
      try { localStorage.setItem(KEY, JSON.stringify(player)); } catch (err) {}
      $('[data-form]').hidden = true;
      msg('Top! Je staat op plek ' + d.rank + ' van ' + d.jaar + '.' + (p.marketing ? ' SNX-acties komen naar ' + p.email + '.' : ''));
      board();
    } catch (err) { msg(ERR[err.message] || 'Versturen lukte niet. Probeer het zo nog eens.', true); }
    finally { btn.disabled = false; }
  }
  window.SNXRanglijst = {
    init(o) { cfg = Object.assign(cfg, o); build(); },
    // na elke ronde: bekende speler gaat automatisch mee, nieuwe speler krijgt een knop om mee te doen
    async score(o) {
      last = { score: Math.floor(o.score || 0), duration: Math.round((o.duration || 0) * 10) / 10 };
      if (last.score <= 0) return;
      if (player) {
        try { const d = await send({ voornaam: player.voornaam, email: player.email, nickname: player.nickname, marketing: !!player.marketing });
          toast('Ranglijst ' + cfg.titel + ': plek ' + d.rank + ' met je beste score ' + d.best + '.');
        } catch (e) { if (e.message !== 'too_fast') toast(ERR[e.message] || 'Je score kon niet verstuurd worden.'); }
      } else if (!this._asked) { this._asked = true; setTimeout(() => this.open(), 900); } // nieuwe speler: één keer per bezoek vragen
    },
    open() {
      $('[data-form]').hidden = !!player || !last || last.score <= 0;
      $('[data-score]').textContent = last ? last.score : 0;
      msg(player ? 'Je speelt mee als ' + player.nickname + '.' : (!last || last.score <= 0 ? 'Speel een ronde om mee te doen.' : ''));
      root.hidden = false; board();
    },
    button(label) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'snxr-btn';
      b.textContent = label || 'RANGLIJST'; b.addEventListener('click', () => this.open()); return b;
    },
  };
})();
