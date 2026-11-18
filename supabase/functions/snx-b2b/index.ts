// SNX B2B-leads uit SNXbar Tycoon: opslaan in b2b_leads en doorzetten naar ActiveCampaign
// (contact + tag "SNX Bar lead" + notitie met wens en business case; nieuwsbrieflijst 3 alleen met opt-in).
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const AC_URL = (Deno.env.get('AC_API_URL') || '').replace(/\/+$/, '');
const AC_KEY = Deno.env.get('AC_API_KEY') || '';
const TAG_NAME = 'SNX Bar lead';
const NEWSLETTER_LIST = 3;
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Max-Age': '86400' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
const db = (path: string, init: RequestInit = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init,
  headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
async function ac(path: string, method = 'GET', body?: unknown) {
  const r = await fetch(`${AC_URL}/api/3/${path}`, { method, headers: { 'Api-Token': AC_KEY, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => null);
  if (!r.ok && r.status !== 422) throw new Error(`ac ${path} ${r.status}`);
  return j;
}
const s = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
const euro = (v: unknown) => typeof v === 'number' ? '€ ' + Math.round(v).toLocaleString('nl-NL') : '-';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  let p: Record<string, unknown>;
  try { p = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  if (typeof p.website === 'string' && p.website) return json({ ok: true });
  const lead = {
    naam: s(p.naam, 120), bedrijf: s(p.bedrijf, 160), email: s(p.email, 254).toLowerCase(), functie: s(p.functie, 80) || null,
    telefoon: s(p.telefoon, 40) || null, land: s(p.land, 60) || null, kanaal: s(p.kanaal, 40) || null,
    wensen: Array.isArray(p.wensen) ? p.wensen.slice(0, 5).map((w) => s(w, 60)) : [], nieuwsbrief: p.nieuwsbrief === true,
    demo: p.demo && typeof p.demo === 'object' && JSON.stringify(p.demo).length < 4000 ? p.demo : null,
  };
  if (!lead.naam || !lead.bedrijf) return json({ error: 'missing_fields' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return json({ error: 'invalid_email' }, 400);
  const since = new Date(Date.now() - 60_000).toISOString();
  const dup = await db(`b2b_leads?select=id&email=eq.${encodeURIComponent(lead.email)}&created_at=gte.${since}&limit=1`).then((r) => r.json()).catch(() => []);
  if (Array.isArray(dup) && dup.length) return json({ ok: true, duplicate: true });
  const ins = await db('b2b_leads', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(lead) });
  if (!ins.ok) { console.error('insert', await ins.text()); return json({ error: 'submit_failed' }, 500); }
  const [row] = await ins.json();

  let synced = false;
  if (AC_URL && AC_KEY) {
    try {
      const [first, ...rest] = lead.naam.split(/\s+/);
      const c = await ac('contact/sync', 'POST', { contact: { email: lead.email, firstName: first, lastName: rest.join(' ') || undefined, phone: lead.telefoon || undefined } });
      const cid = c?.contact?.id;
      if (cid) {
        const found = await ac(`tags?search=${encodeURIComponent(TAG_NAME)}`);
        let tagId = found?.tags?.find((t: { tag: string }) => t.tag === TAG_NAME)?.id;
        if (!tagId) tagId = (await ac('tags', 'POST', { tag: { tag: TAG_NAME, tagType: 'contact', description: 'Zakelijke aanvraag via SNXbar Tycoon' } }))?.tag?.id;
        if (tagId) await ac('contactTags', 'POST', { contactTag: { contact: cid, tag: tagId } });
        if (lead.nieuwsbrief) await ac('contactLists', 'POST', { contactList: { list: NEWSLETTER_LIST, contact: cid, status: 1 } });
        const d = (lead.demo || {}) as Record<string, any>;
        const note = [
          `Aanvraag via SNXbar Tycoon (${lead.kanaal || 'onbekend kanaal'})`,
          `Bedrijf: ${lead.bedrijf}${lead.functie ? ' · ' + lead.functie : ''}${lead.land ? ' · ' + lead.land : ''}`,
          `Wil graag: ${lead.wensen.length ? lead.wensen.join(', ') : '-'}`,
          `Telefoon: ${lead.telefoon || '-'} · Zakelijk nieuws: ${lead.nieuwsbrief ? 'ja' : 'nee'}`,
          d.units != null ? `Demo-dienst: ${d.units} verkocht, marge ${euro(d.margin)}${d.calc?.marginPerYear ? ', berekend per jaar ' + euro(d.calc.marginPerYear) : ''}` : '',
        ].filter(Boolean).join('\n');
        await ac('notes', 'POST', { note: { note, relid: cid, reltype: 'Subscriber' } });
        await db(`b2b_leads?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ ac_synced: true, ac_synced_at: new Date().toISOString() }) });
        synced = true;
      }
    } catch (e) { console.error('ac sync failed', e); }
  }
  return json({ ok: true, synced });
});
