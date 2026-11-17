// SNX Club Cup: public endpoint for the game.
// GET  -> { top: 10 players, clubs: top 5 clubs, clubnamen: known club names } of the current year
// POST -> submit a tournament (+ lead + club). Only players who ticked the optional newsletter box
//         are synced to ActiveCampaign (list AC_CLUBCUP_LIST_ID, default 39; tag AC_CLUBCUP_TAG_ID if set).
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const AC_URL = (Deno.env.get('AC_API_URL') || '').replace(/\/+$/, '');
const AC_KEY = Deno.env.get('AC_API_KEY') || '';
const AC_LIST_ID = Number(Deno.env.get('AC_CLUBCUP_LIST_ID') || 39);
const AC_TAG_ID = Number(Deno.env.get('AC_CLUBCUP_TAG_ID') || 0); // create tag "game-club-cup" in AC and set its id

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const body = await r.json().catch(() => null);
  return { ok: r.ok, body };
}

async function ac(path: string, payload: unknown) {
  const r = await fetch(`${AC_URL}/api/3/${path}`, {
    method: 'POST',
    headers: { 'Api-Token': AC_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await r.json().catch(() => null);
  if (!r.ok && r.status !== 422) throw new Error(`ac ${path} ${r.status}`);
  return body;
}

async function syncLead(leadId: string, email: string, voornaam: string) {
  if (!AC_URL || !AC_KEY) return false; // not configured yet: lead stays ac_synced = false for a later backfill
  const c = await ac('contact/sync', { contact: { email, firstName: voornaam || undefined } });
  const contactId = c?.contact?.id;
  if (!contactId) return false;
  await ac('contactLists', { contactList: { list: AC_LIST_ID, contact: contactId, status: 1 } });
  if (AC_TAG_ID) await ac('contactTags', { contactTag: { contact: contactId, tag: AC_TAG_ID } });
  await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`, {
    method: 'PATCH',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ac_synced: true, ac_synced_at: new Date().toISOString() }),
  });
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  if (req.method === 'GET') {
    const { ok, body } = await rpc('club_cup_leaderboard', { p_limit: 10, p_clubs: 5 });
    return ok ? json(body) : json({ error: 'leaderboard_failed' }, 500);
  }

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let p: Record<string, unknown>;
  try { p = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  if (typeof p.website === 'string' && p.website.length > 0) return json({ ok: true, rank: null }); // honeypot

  const email = String(p.email ?? '').trim().toLowerCase();
  const voornaam = String(p.voornaam ?? '').trim().slice(0, 60);
  const { ok, body } = await rpc('submit_club_cup', {
    p_email: email,
    p_voornaam: voornaam,
    p_nickname: String(p.nickname ?? ''),
    p_club: String(p.club ?? '').slice(0, 60),
    p_terms: p.terms === true,
    p_marketing: p.marketing === true,
    p_padel: Math.floor(Number(p.padel)),
    p_golf: Math.floor(Number(p.golf)),
    p_penalty: Math.floor(Number(p.penalty)),
    p_duration: Math.round(Number(p.duration) * 10) / 10,
  });
  if (!ok) {
    const msg = String(body?.message ?? '');
    const code = ['terms_required', 'invalid_email', 'invalid_nickname', 'invalid_club', 'implausible_score', 'too_fast'].find((c) => msg.includes(c)) ?? 'submit_failed';
    return json({ error: code }, code === 'submit_failed' ? 500 : 400);
  }

  let synced = false;
  if (body.marketing === true) {
    try { synced = await syncLead(body.lead_id, email, voornaam); } catch (e) { console.error('ac sync failed', e); }
  }
  return json({ ok: true, rank: body.rank, best: body.best, jaar: body.jaar, club: body.club, club_rank: body.club_rank, newsletter: body.marketing === true, synced });
});
