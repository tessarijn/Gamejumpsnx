-- Pending: apply in project snx-snack-rush (kzauqjavoaphzxnvmbua) BEFORE deploying supabase/functions/snack-rush.
alter table public.leads add column if not exists terms_accepted_at timestamptz;
alter table public.leads alter column marketing_consent set default false;

drop function if exists public.submit_score(text, text, text, boolean, integer, integer, integer, numeric);

-- p_terms: required (accepts the actievoorwaarden + privacy). p_marketing: optional newsletter opt-in.
create or replace function public.submit_score(
  p_email text, p_voornaam text, p_nickname text, p_terms boolean, p_marketing boolean,
  p_score integer, p_snacks integer, p_distance integer, p_duration numeric
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
  v_year integer := extract(year from (now() at time zone 'Europe/Amsterdam'))::int;
  v_nick text := btrim(coalesce(p_nickname, ''));
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
  if p_duration is null or p_duration < 3 or p_duration > 3600
     or p_distance < 0 or p_distance > p_duration * 45
     or p_snacks < 0 or p_snacks > p_distance / 1.5 + 6
     or p_score < 0
     or p_score > p_distance * 1.0 + p_snacks * 200 + (p_distance / 5) * 30 + (p_duration / 15 + 2) * 400 + 100 then
    raise exception 'implausible_score' using errcode = '22023';
  end if;

  insert into leads (email, voornaam, marketing_consent, consent_at, terms_accepted_at)
  values (lower(p_email), nullif(btrim(p_voornaam), ''), coalesce(p_marketing, false),
          case when p_marketing then now() end, now())
  on conflict (email) do update
    set voornaam = coalesce(excluded.voornaam, leads.voornaam),
        marketing_consent = leads.marketing_consent or excluded.marketing_consent,
        consent_at = coalesce(leads.consent_at, excluded.consent_at),
        terms_accepted_at = coalesce(leads.terms_accepted_at, excluded.terms_accepted_at)
  returning id, (xmax = 0), marketing_consent into v_lead, v_new, v_marketing;

  if exists (select 1 from scores where lead_id = v_lead and created_at > now() - interval '15 seconds') then
    raise exception 'too_fast' using errcode = '22023';
  end if;

  insert into scores (lead_id, nickname, score, snacks, distance_m, duration_s, jaar)
  values (v_lead, v_nick, p_score, p_snacks, p_distance, p_duration, v_year);

  select max(score) into v_best from scores where lead_id = v_lead and jaar = v_year;
  select count(*) + 1 into v_rank from (
    select lead_id, max(score) as best from scores where jaar = v_year group by lead_id
  ) b where b.best > v_best;

  return jsonb_build_object('lead_id', v_lead, 'new_lead', v_new, 'marketing', v_marketing,
                            'best', v_best, 'rank', v_rank, 'jaar', v_year);
end;
$$;

revoke all on function public.submit_score(text, text, text, boolean, boolean, integer, integer, integer, numeric) from public, anon, authenticated;
grant execute on function public.submit_score(text, text, text, boolean, boolean, integer, integer, integer, numeric) to service_role;

-- Existing rows were collected with a forced newsletter tick: treat them as no marketing consent.
update public.leads set marketing_consent = false, consent_at = null, terms_accepted_at = coalesce(terms_accepted_at, created_at);
