-- SNX Club Cup: scores per player and per sports club. Reuses public.leads (same consent model as Snack Rush).
-- Pending: apply in project snx-snack-rush (kzauqjavoaphzxnvmbua) BEFORE deploying supabase/functions/club-cup.

create table if not exists public.club_cup_scores (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  nickname text not null,
  club text not null,
  club_key text not null,
  score integer not null,
  padel integer not null,
  golf integer not null,
  penalty integer not null,
  duration_s numeric not null,
  jaar integer not null,
  created_at timestamptz not null default now()
);
create index if not exists club_cup_scores_jaar_lead on public.club_cup_scores (jaar, lead_id);
create index if not exists club_cup_scores_jaar_club on public.club_cup_scores (jaar, club_key);
alter table public.club_cup_scores enable row level security; -- no policies: only the service role (Edge Function) reads and writes

-- "Padel Club  Utrecht" and "padel club utrecht" count as the same club.
create or replace function public.club_cup_key(p_club text) returns text
language sql immutable as $$
  select regexp_replace(lower(btrim(coalesce(p_club, ''))), '[^[:alnum:]]+', '', 'g')
$$;

create or replace function public.club_cup_leaderboard(p_limit integer default 10, p_clubs integer default 5)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with y as (select extract(year from (now() at time zone 'Europe/Amsterdam'))::int as jaar),
  best as ( -- best run per player this year; the club of that player's latest run
    select distinct on (s.lead_id) s.lead_id, s.nickname, s.score,
           (select c.club_key from club_cup_scores c, y where c.lead_id = s.lead_id and c.jaar = y.jaar order by c.created_at desc limit 1) as club_key
    from club_cup_scores s, y
    where s.jaar = y.jaar
    order by s.lead_id, s.score desc, s.created_at asc
  ),
  names as ( -- most used spelling of each club
    select distinct on (club_key) club_key, club
    from (select club_key, club, count(*) n from club_cup_scores, y where club_cup_scores.jaar = y.jaar group by club_key, club) x
    order by club_key, n desc, club
  ),
  players as (
    select b.nickname, b.score, n.club, rank() over (order by b.score desc) as rank
    from best b join names n using (club_key)
    order by b.score desc limit p_limit
  ),
  clubs as (
    select n.club, count(*)::int as spelers, sum(b.score)::int as punten,
           rank() over (order by count(*) desc, sum(b.score) desc) as rank
    from best b join names n using (club_key)
    group by n.club
    order by spelers desc, punten desc limit p_clubs
  )
  select jsonb_build_object(
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rank, 'nickname', nickname, 'club', club, 'score', score) order by rank, nickname) from players), '[]'::jsonb),
    'clubs', coalesce((select jsonb_agg(jsonb_build_object('rank', rank, 'club', club, 'spelers', spelers, 'punten', punten) order by rank, club) from clubs), '[]'::jsonb),
    'clubnamen', coalesce((select jsonb_agg(club order by club) from (select club from names limit 200) z), '[]'::jsonb)
  );
$$;

create or replace function public.submit_club_cup(
  p_email text, p_voornaam text, p_nickname text, p_club text, p_terms boolean, p_marketing boolean,
  p_padel integer, p_golf integer, p_penalty integer, p_duration numeric
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_lead uuid;
  v_new boolean;
  v_marketing boolean;
  v_best integer;
  v_rank integer;
  v_club_rank integer;
  v_score integer;
  v_year integer := extract(year from (now() at time zone 'Europe/Amsterdam'))::int;
  v_nick text := btrim(coalesce(p_nickname, ''));
  v_club text := regexp_replace(btrim(coalesce(p_club, '')), '\s+', ' ', 'g');
  v_key text := public.club_cup_key(p_club);
begin
  if p_terms is not true then
    raise exception 'terms_required' using errcode = '22023';
  end if;
  if p_email is null or length(p_email) > 254 or p_email !~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if v_nick !~ '^[A-Za-z0-9 _.\-]{2,16}$' then
    raise exception 'invalid_nickname' using errcode = '22023';
  end if;
  if length(v_club) < 2 or length(v_club) > 40 or length(v_key) < 2 or v_club ~ '[<>{}\[\]\\/@#$%^*=+|~`";:?!]' then
    raise exception 'invalid_club' using errcode = '22023';
  end if;
  -- per-sport ceilings follow the game rules: padel 45 s, golf 3 holes (300 max) + snacks, penalty 6 x (100 + 50 + 50)
  if p_duration is null or p_duration < 15 or p_duration > 3600
     or p_padel is null or p_padel < 0 or p_padel > 3000
     or p_golf is null or p_golf < 0 or p_golf > 1300
     or p_penalty is null or p_penalty < 0 or p_penalty > 1200 or p_penalty % 5 <> 0 then
    raise exception 'implausible_score' using errcode = '22023';
  end if;
  v_score := p_padel + p_golf + p_penalty;

  insert into leads (email, voornaam, marketing_consent, consent_at, terms_accepted_at)
  values (lower(p_email), nullif(btrim(p_voornaam), ''), coalesce(p_marketing, false),
          case when p_marketing then now() end, now())
  on conflict (email) do update
    set voornaam = coalesce(excluded.voornaam, leads.voornaam),
        marketing_consent = leads.marketing_consent or excluded.marketing_consent,
        consent_at = coalesce(leads.consent_at, excluded.consent_at),
        terms_accepted_at = coalesce(leads.terms_accepted_at, excluded.terms_accepted_at)
  returning id, (xmax = 0), marketing_consent into v_lead, v_new, v_marketing;

  if exists (select 1 from club_cup_scores where lead_id = v_lead and created_at > now() - interval '15 seconds') then
    raise exception 'too_fast' using errcode = '22023';
  end if;

  insert into club_cup_scores (lead_id, nickname, club, club_key, score, padel, golf, penalty, duration_s, jaar)
  values (v_lead, v_nick, v_club, v_key, v_score, p_padel, p_golf, p_penalty, p_duration, v_year);

  select max(score) into v_best from club_cup_scores where lead_id = v_lead and jaar = v_year;
  select count(*) + 1 into v_rank from (
    select lead_id, max(score) as best from club_cup_scores where jaar = v_year group by lead_id
  ) b where b.best > v_best;

  with latest as ( -- each player's current club this year
    select distinct on (lead_id) lead_id, club_key from club_cup_scores where jaar = v_year order by lead_id, created_at desc
  ), best as (
    select lead_id, max(score) as best from club_cup_scores where jaar = v_year group by lead_id
  ), per_club as (
    select l.club_key, count(*) as spelers, sum(b.best) as punten from latest l join best b using (lead_id) group by l.club_key
  )
  select count(*) + 1 into v_club_rank
  from per_club o, (select spelers, punten from per_club where club_key = v_key) me
  where o.spelers > me.spelers or (o.spelers = me.spelers and o.punten > me.punten);

  return jsonb_build_object('lead_id', v_lead, 'new_lead', v_new, 'marketing', v_marketing,
                            'best', v_best, 'rank', v_rank, 'jaar', v_year, 'club', v_club, 'club_rank', v_club_rank);
end;
$$;

revoke all on function public.submit_club_cup(text, text, text, text, boolean, boolean, integer, integer, integer, numeric) from public, anon, authenticated;
grant execute on function public.submit_club_cup(text, text, text, text, boolean, boolean, integer, integer, integer, numeric) to service_role;
revoke all on function public.club_cup_leaderboard(integer, integer) from public, anon, authenticated;
grant execute on function public.club_cup_leaderboard(integer, integer) to service_role;
