-- Forms database. Run once in Supabase: SQL Editor, New query, paste all of this, Run.
-- Running it again is safe: it keeps your data and updates the functions.
--
-- The app calls one function, fm_api(action, args, token). The tables are locked
-- (row-level security on, no policies), so the browser can only reach them
-- through that function. People filling a form can read that one form and send
-- answers; everything else needs your admin password.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.fm_forms (
  id         text primary key,
  data       jsonb not null,
  status     text not null default 'open',
  created_at bigint not null,
  updated_at bigint not null
);
create table if not exists public.fm_responses (
  id         text primary key,
  form_id    text not null references public.fm_forms on delete cascade,
  answers    jsonb not null,
  created_at bigint not null
);
create index if not exists fm_responses_form on public.fm_responses (form_id, created_at);
create table if not exists public.fm_admin (k text primary key, v text not null);
create table if not exists public.fm_sessions (token text primary key, created_at bigint not null);

alter table public.fm_forms     enable row level security;
alter table public.fm_responses enable row level security;
alter table public.fm_admin     enable row level security;
alter table public.fm_sessions  enable row level security;

-- pictures in forms go to a public "uploads" bucket (shared with Ka-Who? if it is in the same project)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('uploads', 'uploads', true, 3000000, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  on conflict (id) do nothing;
drop policy if exists "anyone can add pictures" on storage.objects;
create policy "anyone can add pictures" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'uploads');

create or replace function public.fm_now() returns bigint
language sql volatile as $$ select (extract(epoch from clock_timestamp()) * 1000)::bigint $$;

create or replace function public.fm_id(n int) returns text
language sql volatile set search_path = public, extensions as $$
  select string_agg(substr('abcdefghijkmnpqrstuvwxyz23456789', (get_byte(b, i) % 32) + 1, 1), '')
  from (select gen_random_bytes(n) as b) x, generate_series(0, n - 1) as i
$$;

create or replace function public.fm_err(status int, msg text) returns jsonb
language sql immutable as $$ select jsonb_build_object('error', msg, 'status', status) $$;

-- closed by hand, or past its closing date
create or replace function public.fm_closed(status text, data jsonb) returns boolean
language plpgsql stable as $$
declare t timestamptz;
begin
  if status <> 'open' then return true; end if;
  if coalesce(data->>'closesAt', '') = '' then return false; end if;
  begin t := (data->>'closesAt')::timestamptz; exception when others then return false; end;
  return t < now();
end $$;

create or replace function public.fm_out(f public.fm_forms, with_counts boolean) returns jsonb
language sql stable as $$
  select jsonb_build_object('id', f.id, 'data', f.data, 'status', f.status, 'createdAt', f.created_at, 'updatedAt', f.updated_at)
    || case when with_counts then jsonb_build_object(
         'responses', (select count(*) from fm_responses x where x.form_id = f.id),
         'lastResponse', (select max(created_at) from fm_responses x where x.form_id = f.id)) else '{}'::jsonb end
$$;

create or replace function public.fm_api(action text, args jsonb default '{}', token text default null)
returns jsonb
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  now_ms bigint := fm_now();
  a jsonb := coalesce(args, '{}');
  f fm_forms%rowtype;
  v_id text; v_want text; v_pw text; v_hash text; ans jsonb; ids text[]; admin boolean := false;
begin
  -- ---------- public
  if action = 'form' then
    select * into f from fm_forms where id = coalesce(a->>'id', '');
    if not found then return fm_err(404, 'This form does not exist.'); end if;
    if fm_closed(f.status, f.data) then
      return jsonb_build_object('id', f.id, 'closed', true, 'title', f.data->'title', 'theme', f.data->'theme', 'closedMessage', coalesce(f.data->'closedMessage', 'null'::jsonb));
    end if;
    return jsonb_build_object('id', f.id, 'closed', false, 'data', f.data);
  end if;

  if action = 'submit' then
    select * into f from fm_forms where id = coalesce(a->>'id', '');
    if not found then return fm_err(404, 'This form does not exist.'); end if;
    if fm_closed(f.status, f.data) then return fm_err(409, 'Sorry, this form is closed.'); end if;
    -- keep only answers to questions that exist in the form
    select coalesce(array_agg(q->>'id'), '{}') into ids
      from jsonb_array_elements(case when jsonb_typeof(f.data->'sections') = 'array' then f.data->'sections' else '[]' end) s,
           jsonb_array_elements(case when jsonb_typeof(s->'questions') = 'array' then s->'questions' else '[]' end) q
      where coalesce(q->>'id', '') <> '';
    select coalesce(jsonb_object_agg(key, value), '{}') into ans
      from jsonb_each(case when jsonb_typeof(a->'answers') = 'object' then a->'answers' else '{}' end)
      where regexp_replace(key, '__other$', '') = any(ids) and value <> 'null'::jsonb and value <> '""'::jsonb;
    if length(ans::text) > 60000 then return fm_err(400, 'Your answers are too long.'); end if;
    v_id := fm_id(12);
    insert into fm_responses (id, form_id, answers, created_at) values (v_id, f.id, ans, now_ms);
    return jsonb_build_object('ok', true, 'id', v_id);
  end if;

  -- ---------- admin sign-in
  select v into v_hash from fm_admin where k = 'password';
  if token ~ '^[a-f0-9]{48}$' then
    admin := exists (select 1 from fm_sessions s where s.token = fm_api.token and s.created_at > now_ms - 180::bigint * 86400000);
  end if;

  if action = 'status' then return jsonb_build_object('setup', v_hash is not null, 'admin', admin); end if;

  if action = 'setup' then
    v_pw := coalesce(a->>'password', '');
    if char_length(v_pw) < 6 then return fm_err(400, 'Use at least 6 characters.'); end if;
    insert into fm_admin (k, v) values ('password', crypt(v_pw, gen_salt('bf', 8))) on conflict (k) do nothing;
    if not found then return fm_err(409, 'A password is already set. Sign in instead.'); end if;
    v_id := encode(gen_random_bytes(24), 'hex'); insert into fm_sessions values (v_id, now_ms);
    return jsonb_build_object('token', v_id);
  end if;

  if action = 'login' then
    if v_hash is null then return fm_err(409, 'No password yet. Create one first.'); end if;
    if v_hash <> crypt(coalesce(a->>'password', ''), v_hash) then perform pg_sleep(0.6); return fm_err(401, 'Wrong password.'); end if;
    delete from fm_sessions where created_at < now_ms - 180::bigint * 86400000;
    v_id := encode(gen_random_bytes(24), 'hex'); insert into fm_sessions values (v_id, now_ms);
    return jsonb_build_object('token', v_id);
  end if;

  if not admin then return fm_err(401, 'Please sign in.'); end if;

  -- ---------- admin
  if action = 'logout' then delete from fm_sessions s where s.token = fm_api.token; return '{"ok":true}'; end if;

  if action = 'password' then
    v_pw := coalesce(a->>'password', '');
    if char_length(v_pw) < 6 then return fm_err(400, 'Use at least 6 characters.'); end if;
    update fm_admin set v = crypt(v_pw, gen_salt('bf', 8)) where k = 'password';
    delete from fm_sessions;
    v_id := encode(gen_random_bytes(24), 'hex'); insert into fm_sessions values (v_id, now_ms);
    return jsonb_build_object('token', v_id);
  end if;

  if action = 'list' then
    return jsonb_build_object('forms', coalesce((select jsonb_agg(fm_out(x, true) order by x.updated_at desc) from fm_forms x), '[]'));
  end if;

  if action = 'save' then
    if jsonb_typeof(a->'data') <> 'object' or jsonb_typeof(a->'data'->'sections') <> 'array' then return fm_err(400, 'The form needs sections with questions.'); end if;
    if length((a->'data')::text) > 200000 then return fm_err(400, 'The form is too big.'); end if;
    v_id := coalesce(a->>'id', '');
    if v_id <> '' then
      update fm_forms set data = a->'data', updated_at = now_ms where id = v_id;
      if not found then return fm_err(404, 'Form not found.'); end if;
    else
      v_want := left(btrim(regexp_replace(lower(coalesce(a->'data'->>'slug', '')), '[^a-z0-9-]+', '-', 'g'), '-'), 40);
      v_id := case when v_want <> '' and v_want not in ('admin', 'forms') then v_want else fm_id(8) end;
      insert into fm_forms (id, data, status, created_at, updated_at) values (v_id, a->'data', 'open', now_ms, now_ms) on conflict (id) do nothing;
      if not found then
        v_id := case when v_want <> '' then v_want || '-' else '' end || fm_id(4);
        insert into fm_forms (id, data, status, created_at, updated_at) values (v_id, a->'data', 'open', now_ms, now_ms);
      end if;
    end if;
    return jsonb_build_object('id', v_id);
  end if;

  if action = 'status-set' then
    update fm_forms set status = case when a->>'status' = 'closed' then 'closed' else 'open' end, updated_at = now_ms where id = coalesce(a->>'id', '');
    return jsonb_build_object('ok', true, 'status', case when a->>'status' = 'closed' then 'closed' else 'open' end);
  end if;

  if action = 'delete' then delete from fm_forms where id = coalesce(a->>'id', ''); return '{"ok":true}'; end if;

  if action = 'responses' then
    select * into f from fm_forms where id = coalesce(a->>'id', '');
    if not found then return fm_err(404, 'Form not found.'); end if;
    return jsonb_build_object('form', fm_out(f, false), 'responses', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'answers', answers, 'createdAt', created_at) order by created_at)
      from fm_responses where form_id = f.id), '[]'));
  end if;

  if action = 'response-delete' then delete from fm_responses where id = coalesce(a->>'id', ''); return '{"ok":true}'; end if;

  return fm_err(404, 'Unknown action.');
end $$;

-- Only fm_api is reachable from the browser.
do $$ declare f record; begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace s on s.oid = p.pronamespace
           where s.nspname = 'public' and p.proname like 'fm\_%' loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;
grant execute on function public.fm_api(text, jsonb, text) to anon, authenticated;
