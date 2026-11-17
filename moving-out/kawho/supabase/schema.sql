-- Ka-Who? database. Run once in Supabase: SQL Editor, New query, paste all of this, Run.
-- Running it again is safe: it keeps your data and updates the functions.
--
-- The app calls one function, kw_api(action, args, token). The tables are
-- locked (row-level security on, no policies), so the browser can only reach
-- them through that function. Scores, timing and correct answers stay here on
-- the server, never in the players' phones.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.kw_users (
  username   text primary key,
  pw         text not null,
  owner      boolean not null default false,
  created_at bigint not null
);
create table if not exists public.kw_sessions (
  token      text primary key,
  username   text not null references public.kw_users on delete cascade,
  created_at bigint not null
);
create table if not exists public.kw_quizzes (
  id         text primary key,
  data       jsonb not null,
  owner      text,
  created_at bigint not null,
  updated_at bigint not null
);
create table if not exists public.kw_games (
  pin        text primary key,
  quiz_id    text,
  quiz       jsonb not null,
  state      jsonb not null,
  owner      text,
  created_at bigint not null
);
create table if not exists public.kw_players (
  pin       text not null,
  id        text not null,
  secret    text not null,
  name      text not null,
  avatar    text not null,
  score     int not null default 0,
  streak    int not null default 0,
  react     text,
  react_at  bigint,
  joined_at bigint not null,
  primary key (pin, id)
);
create table if not exists public.kw_answers (
  pin       text not null,
  player_id text not null,
  q         int not null,
  answer    jsonb,
  correct   boolean,
  points    int not null default 0,
  ms        int not null,
  at        bigint not null,
  primary key (pin, player_id, q)
);
create index if not exists kw_players_score on public.kw_players (pin, score desc);
create index if not exists kw_answers_q on public.kw_answers (pin, q);
create index if not exists kw_quizzes_owner on public.kw_quizzes (owner, updated_at desc);

alter table public.kw_users    enable row level security;
alter table public.kw_sessions enable row level security;
alter table public.kw_quizzes  enable row level security;
alter table public.kw_games    enable row level security;
alter table public.kw_players  enable row level security;
alter table public.kw_answers  enable row level security;

-- pictures in quizzes go to a public "uploads" bucket (shared with Forms if it is in the same project)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('uploads', 'uploads', true, 3000000, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  on conflict (id) do nothing;
drop policy if exists "anyone can add pictures" on storage.objects;
create policy "anyone can add pictures" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'uploads');

-- ---------- small helpers ----------
create or replace function public.kw_now() returns bigint
language sql volatile as $$ select (extract(epoch from clock_timestamp()) * 1000)::bigint $$;

create or replace function public.kw_id(n int) returns text
language sql volatile set search_path = public, extensions as $$
  select string_agg(substr('abcdefghijkmnpqrstuvwxyz23456789', (get_byte(b, i) % 32) + 1, 1), '')
  from (select gen_random_bytes(n) as b) x, generate_series(0, n - 1) as i
$$;

-- lower case, no accents, only letters and numbers: "  Ankara!" and "ankara" match
create or replace function public.kw_fold(s text) returns text
language sql immutable as $$
  select btrim(regexp_replace(
    translate(lower(translate(coalesce(s, ''), 'İIı', 'iii')),
      'áàâäãåāçćčéèêëēęğíìîïīłñńóòôöõøōśşšúùûüūýÿźżž',
      'aaaaaaaccceeeeeegiiiiilnnoooooooosssuuuuuyyzzz'),
    '[^a-z0-9]+', ' ', 'g'))
$$;

-- a whole number from JSON, or null
create or replace function public.kw_int(v jsonb) returns int
language sql immutable as $$
  select case when jsonb_typeof(v) = 'number' and (v #>> '{}')::numeric = trunc((v #>> '{}')::numeric)
              and abs((v #>> '{}')::numeric) < 100000 then (v #>> '{}')::int end
$$;

create or replace function public.kw_err(status int, msg text) returns jsonb
language sql immutable as $$ select jsonb_build_object('error', msg, 'status', status) $$;

-- the question as players may see it: no correct answers
create or replace function public.kw_public_q(q jsonb, st jsonb) returns jsonb
language plpgsql immutable as $$
declare out jsonb;
begin
  out := jsonb_build_object('type', q->>'type', 'q', q->>'q', 'image', coalesce(q->'image', 'null'::jsonb),
    'time', coalesce(q->'time', '20'::jsonb), 'points', coalesce(q->'points', '1'::jsonb));
  if jsonb_typeof(q->'options') = 'array' then
    out := out || jsonb_build_object('options', (select coalesce(jsonb_agg(jsonb_build_object('t', coalesce(o->>'t', ''), 'img', coalesce(o->'img', 'null'::jsonb)) order by i), '[]')
      from jsonb_array_elements(q->'options') with ordinality as t(o, i)));
  end if;
  if q->>'type' = 'order' then
    out := out || jsonb_build_object('items', (select coalesce(jsonb_agg(coalesce(q->'items'->>(o #>> '{}')::int, '') order by i), '[]')
      from jsonb_array_elements(coalesce(st->'order', '[]')) with ordinality as t(o, i)));
  end if;
  if q->>'type' = 'slider' then
    out := out || jsonb_build_object('min', coalesce(q->'min', '0'), 'max', coalesce(q->'max', '100'), 'step', coalesce(q->'step', '1'), 'unit', coalesce(q->'unit', '""'));
  end if;
  if q->>'type' = 'type' then out := out || '{"maxLen":40}'; end if;
  return out;
end $$;

create or replace function public.kw_reveal(q jsonb) returns jsonb
language plpgsql immutable as $$
declare out jsonb := '{}';
begin
  if jsonb_typeof(q->'options') = 'array' then
    out := out || jsonb_build_object('correct', (select coalesce(jsonb_agg(i - 1 order by i), '[]')
      from jsonb_array_elements(q->'options') with ordinality as t(o, i) where (o->>'ok')::boolean is true));
  end if;
  if q->>'type' = 'type' then out := out || jsonb_build_object('answers', coalesce(q->'answers', '[]')); end if;
  if q->>'type' = 'slider' then out := out || jsonb_build_object('value', coalesce(q->'correct', '0'), 'tol', coalesce(q->'tol', '0')); end if;
  if q->>'type' = 'order' then out := out || jsonb_build_object('items', coalesce(q->'items', '[]')); end if;
  return out;
end $$;

-- is this answer right? (null for polls and word clouds)
create or replace function public.kw_check(q jsonb, a jsonb, st jsonb) returns boolean
language plpgsql immutable as $$
declare t text := q->>'type'; want text; got text; n int;
begin
  if t in ('quiz', 'tf') then
    return kw_int(a) is not null and kw_int(a) >= 0 and coalesce((q->'options'->kw_int(a)->>'ok')::boolean, false);
  elsif t = 'multi' then
    if jsonb_typeof(a) <> 'array' then return false; end if;
    select coalesce(string_agg((i - 1)::text, ',' order by i), '') into want
      from jsonb_array_elements(coalesce(q->'options', '[]')) with ordinality as x(o, i) where (o->>'ok')::boolean is true;
    select coalesce(string_agg(v::text, ',' order by v), '') into got
      from (select distinct kw_int(e) as v from jsonb_array_elements(a) e) d where v is not null;
    return got = want;
  elsif t = 'type' then
    if kw_fold(a #>> '{}') = '' then return false; end if;
    return exists (select 1 from jsonb_array_elements_text(coalesce(q->'answers', '[]')) x where kw_fold(x) = kw_fold(a #>> '{}'));
  elsif t = 'slider' then
    return jsonb_typeof(a) = 'number' and abs((a #>> '{}')::numeric - coalesce((q->>'correct')::numeric, 0)) <= coalesce((q->>'tol')::numeric, 0) + 0.000000001;
  elsif t = 'order' then
    -- a = positions in the shuffled list; map back to the original items
    if jsonb_typeof(a) <> 'array' or jsonb_typeof(st->'order') <> 'array' then return false; end if;
    n := jsonb_array_length(coalesce(q->'items', '[]'));
    if jsonb_array_length(a) <> n then return false; end if;
    return not exists (
      select 1 from jsonb_array_elements(a) with ordinality as x(p, i)
      where kw_int(p) is null or (st->'order'->>kw_int(p))::int is distinct from (i - 1)::int);
  end if;
  return null;
end $$;

create or replace function public.kw_stats(q jsonb, p_pin text, qi int) returns jsonb
language plpgsql stable as $$
declare s jsonb; t text := q->>'type';
begin
  select jsonb_build_object('answered', count(*), 'right', count(*) filter (where correct)) into s
    from kw_answers where pin = p_pin and kw_answers.q = qi;
  if jsonb_typeof(q->'options') = 'array' then
    s := s || jsonb_build_object('counts', (
      select jsonb_agg((select count(*) from kw_answers a,
          jsonb_array_elements(case when jsonb_typeof(a.answer) = 'array' then a.answer else jsonb_build_array(a.answer) end) v
        where a.pin = p_pin and a.q = qi and kw_int(v) = (i - 1)::int) order by i)
      from jsonb_array_elements(q->'options') with ordinality as x(o, i)));
  end if;
  if t in ('type', 'cloud') then
    s := s || jsonb_build_object('words', coalesce((
      select jsonb_agg(jsonb_build_object('text', w, 'n', n) order by n desc, w) from (
        select min(left(btrim(a.answer #>> '{}'), 40)) as w, count(*) as n
        from kw_answers a where a.pin = p_pin and a.q = qi and kw_fold(a.answer #>> '{}') <> ''
        group by kw_fold(a.answer #>> '{}') order by count(*) desc limit 40) g), '[]'));
  end if;
  if t = 'slider' then
    s := s || jsonb_build_object('values', coalesce((select jsonb_agg(answer) from kw_answers a
      where a.pin = p_pin and a.q = qi and jsonb_typeof(answer) = 'number'), '[]'));
  end if;
  return s;
end $$;

create or replace function public.kw_shuffle(n int) returns jsonb
language plpgsql volatile as $$
declare o int[]; i int; j int; tmp int;
begin
  select coalesce(array_agg(g order by g), '{}') into o from generate_series(0, n - 1) g;
  for i in reverse n .. 2 loop
    j := 1 + floor(random() * i)::int; tmp := o[i]; o[i] := o[j]; o[j] := tmp;
  end loop;
  -- never hand out the right order
  if n > 1 and o = (select array_agg(g order by g) from generate_series(0, n - 1) g) then tmp := o[1]; o[1] := o[2]; o[2] := tmp; end if;
  return to_jsonb(o);
end $$;

-- ---------- the API ----------
create or replace function public.kw_api(action text, args jsonb default '{}', token text default null)
returns jsonb
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  now_ms bigint := kw_now();
  a jsonb := coalesce(args, '{}');
  pin_ text := left(regexp_replace(coalesce(a->>'pin', ''), '\D', '', 'g'), 6);
  g kw_games%rowtype;
  st jsonb; q jsonb; qs jsonb; qi int;
  p kw_players%rowtype;
  me_user text; me_owner boolean;
  v_name text; v_avatar text; v_id text; v_secret text; v_pw text; v_user text;
  n int; ok boolean; ans jsonb; lim bigint; ms bigint; base int; pts int; strk int;
  r record; out jsonb; prev jsonb; t jsonb;
  -- must match the lists in kawho-core.js: 20 drawn people (p), 60 emoji (e), 24 old critters (a)
  new_avatars text[] := array(select 'p' || i from generate_series(0, 19) i) || array(select 'e' || i from generate_series(0, 59) i);
  all_avatars text[] := array(select 'p' || i from generate_series(0, 19) i) || array(select 'e' || i from generate_series(0, 59) i) || array(select 'a' || i from generate_series(0, 23) i);
  scored text[] := array['quiz', 'tf', 'multi', 'type', 'slider', 'order'];
begin
  -- ================= players =================
  if action = 'state' then
    select * into g from kw_games where kw_games.pin = pin_;
    if not found then return kw_err(404, 'No game with that PIN.'); end if;
    st := g.state; qs := g.quiz->'questions'; qi := (st->>'q')::int; q := qs->qi;
    select count(*) into n from kw_players where kw_players.pin = pin_;
    out := jsonb_build_object('pin', pin_, 'title', coalesce(g.quiz->>'title', 'Quiz'), 'cover', coalesce(g.quiz->'cover', 'null'::jsonb),
      'phase', st->>'phase', 'q', qi, 'total', jsonb_array_length(qs), 'v', st->'v', 'players', n,
      'locked', coalesce((st->>'locked')::boolean, false), 'theme', coalesce(st->'theme', 'null'::jsonb), 'serverNow', now_ms);
    if q is not null and st->>'phase' <> 'lobby' then
      out := out || jsonb_build_object('question', kw_public_q(q, st), 'startAt', st->'startAt', 'endAt', st->'endAt');
    end if;
    if q is not null and st->>'phase' = 'reveal' then
      out := out || jsonb_build_object('reveal', kw_reveal(q), 'stats', coalesce(st->'stats', 'null'::jsonb));
    end if;
    if st->>'phase' in ('leaderboard', 'podium') then
      out := out || jsonb_build_object('top', coalesce((select jsonb_agg(x) from (select x from jsonb_array_elements(coalesce(st->'top', '[]')) x limit 5) y), '[]'));
    end if;
    return out;
  end if;

  if action = 'join' then
    select * into g from kw_games where kw_games.pin = pin_;
    if not found then return kw_err(404, 'No game with that PIN. Check the number on the screen.'); end if;
    if coalesce((g.state->>'locked')::boolean, false) then return kw_err(423, 'This game is locked. Ask the host to unlock it.'); end if;
    if g.state->>'phase' = 'podium' then return kw_err(409, 'This game has finished.'); end if;
    v_name := left(btrim(regexp_replace(coalesce(a->>'name', ''), '\s+', ' ', 'g')), 20);
    if char_length(v_name) < 2 then return kw_err(400, 'Write a name with at least 2 letters.'); end if;
    v_avatar := case when a->>'avatar' = any(all_avatars) then a->>'avatar' else new_avatars[1 + floor(random() * array_length(new_avatars, 1))::int] end;
    perform pg_advisory_xact_lock(hashtext('kw_join_' || pin_));
    select count(*) into n from kw_players where kw_players.pin = pin_;
    if n >= 200 then return kw_err(409, 'This game is full.'); end if;
    if exists (select 1 from kw_players where kw_players.pin = pin_ and kw_fold(name) = kw_fold(v_name)) then
      return kw_err(409, 'Someone already has that name. Try another one.');
    end if;
    v_id := kw_id(8); v_secret := kw_id(16);
    insert into kw_players (pin, id, secret, name, avatar, joined_at) values (pin_, v_id, v_secret, v_name, v_avatar, now_ms);
    return jsonb_build_object('pid', v_id, 'secret', v_secret, 'name', v_name, 'avatar', v_avatar, 'serverNow', now_ms);
  end if;

  if action in ('answer', 'me', 'react') and coalesce(a->>'secret', '') <> '' then
    select * into p from kw_players where kw_players.pin = pin_ and id = coalesce(a->>'pid', '') and secret = a->>'secret';
  end if;

  if action = 'answer' then
    if p.id is null then return kw_err(404, 'You are not in this game any more.'); end if;
    select * into g from kw_games where kw_games.pin = pin_;
    if not found then return kw_err(404, 'The game has ended.'); end if;
    st := g.state; qi := kw_int(a->'q'); q := g.quiz->'questions'->qi;
    if st->>'phase' <> 'question' or qi is distinct from (st->>'q')::int or q is null then return kw_err(409, 'Too late for this question.'); end if;
    if now_ms < (st->>'startAt')::bigint - 300 then return kw_err(409, 'Wait for the question to start.'); end if;
    if now_ms > (st->>'endAt')::bigint + 800 then return kw_err(409, 'Time''s up!'); end if;
    ans := a->'answer';
    if q->>'type' in ('type', 'cloud') then ans := to_jsonb(left(coalesce(ans #>> '{}', ''), 40));
    elsif q->>'type' in ('slider', 'quiz', 'tf', 'poll') then ans := case when jsonb_typeof(ans) = 'number' then ans else 'null'::jsonb end;
    elsif q->>'type' in ('multi', 'order') then
      ans := case when jsonb_typeof(ans) = 'array' then coalesce((select jsonb_agg(to_jsonb(kw_int(e)) order by i) from jsonb_array_elements(ans) with ordinality x(e, i) where i <= 12), '[]') else '[]' end;
    end if;
    ok := kw_check(q, ans, st);
    lim := greatest(1000, (st->>'endAt')::bigint - (st->>'startAt')::bigint);
    ms := greatest(0, least(lim, now_ms - (st->>'startAt')::bigint));
    base := case when q->>'type' = any(scored) then 1000 * coalesce((q->>'points')::numeric, 1)::int else 0 end;
    pts := 0; strk := p.streak;
    if base > 0 and ok then
      strk := strk + 1;
      pts := round(base * (1 - (ms::numeric / lim) / 2)) + least(strk - 1, 5) * 100;
    elsif base > 0 then strk := 0;
    end if;
    insert into kw_answers (pin, player_id, q, answer, correct, points, ms, at) values (pin_, p.id, qi, ans, ok, pts, ms, now_ms) on conflict do nothing;
    if not found then return kw_err(409, 'You already answered.'); end if;
    if base > 0 then update kw_players set score = score + pts, streak = strk where kw_players.pin = pin_ and id = p.id; end if;
    return jsonb_build_object('ok', true, 'serverNow', now_ms);
  end if;

  if action = 'me' and coalesce(a->>'secret', '') <> '' then
    if p.id is null then return kw_err(404, 'You are not in this game any more.'); end if;
    qi := coalesce(kw_int(a->'q'), -1);
    select count(*) + 1 into n from kw_players where kw_players.pin = pin_ and score > p.score;
    out := jsonb_build_object('name', p.name, 'avatar', p.avatar, 'score', p.score, 'streak', p.streak, 'rank', n,
      'total', (select count(*) from kw_players where kw_players.pin = pin_),
      'above', (select jsonb_build_object('name', name, 'gap', score - p.score) from kw_players where kw_players.pin = pin_ and score > p.score order by score asc limit 1),
      'last', case when qi >= 0 then (select jsonb_build_object('answer', answer, 'correct', correct, 'points', points) from kw_answers where kw_answers.pin = pin_ and player_id = p.id and kw_answers.q = qi) end,
      'serverNow', now_ms);
    return out;
  end if;

  if action = 'react' then
    if p.id is null then return kw_err(404, 'Not in the game.'); end if;
    update kw_players set react = case when a->>'emoji' in ('like', 'haha', 'wow', 'fire', 'love', 'clap') then a->>'emoji' else 'like' end, react_at = now_ms
      where kw_players.pin = pin_ and id = p.id;
    return '{"ok":true}';
  end if;

  -- ================= host accounts =================
  if token ~ '^[a-f0-9]{48}$' then
    select u.username, u.owner into me_user, me_owner from kw_sessions s join kw_users u on u.username = s.username
      where s.token = kw_api.token and s.created_at > now_ms - 180::bigint * 86400000;
  end if;

  if action = 'auth-status' then
    if not exists (select 1 from kw_users) then return '{"setup":false,"me":null}'; end if;
    return jsonb_build_object('setup', true, 'me', case when me_user is null then null else jsonb_build_object('username', me_user, 'owner', me_owner) end);
  end if;

  if action = 'setup' then
    v_user := lower(btrim(coalesce(a->>'username', ''))); v_pw := coalesce(a->>'password', '');
    if v_user !~ '^[a-z0-9._-]{3,20}$' then return kw_err(400, 'Username: 3 to 20 letters or numbers (no spaces).'); end if;
    if char_length(v_pw) < 6 then return kw_err(400, 'Use at least 6 characters for the password.'); end if;
    perform pg_advisory_xact_lock(hashtext('kw_setup'));
    if exists (select 1 from kw_users) then return kw_err(409, 'The first account is already made. Sign in instead.'); end if;
    insert into kw_users (username, pw, owner, created_at) values (v_user, crypt(v_pw, gen_salt('bf', 8)), true, now_ms);
    update kw_quizzes set owner = v_user where owner is null;
    update kw_games set owner = v_user where owner is null;
    v_id := encode(gen_random_bytes(24), 'hex');
    insert into kw_sessions values (v_id, v_user, now_ms);
    return jsonb_build_object('token', v_id, 'me', jsonb_build_object('username', v_user, 'owner', true));
  end if;

  if action = 'login' then
    v_user := lower(btrim(coalesce(a->>'username', ''))); v_pw := coalesce(a->>'password', '');
    select * into r from kw_users where username = v_user;
    if not found or r.pw <> crypt(v_pw, r.pw) then
      perform pg_sleep(0.5);
      return kw_err(401, 'Wrong username or password.');
    end if;
    delete from kw_sessions where created_at < now_ms - 180::bigint * 86400000;
    v_id := encode(gen_random_bytes(24), 'hex');
    insert into kw_sessions values (v_id, v_user, now_ms);
    return jsonb_build_object('token', v_id, 'me', jsonb_build_object('username', v_user, 'owner', r.owner));
  end if;

  if action = 'logout' then
    delete from kw_sessions where kw_sessions.token = kw_api.token;
    return '{"ok":true}';
  end if;

  -- ================= host (signed in) =================
  if me_user is null then return kw_err(401, 'Please sign in.'); end if;

  if action = 'me' then return jsonb_build_object('me', jsonb_build_object('username', me_user, 'owner', me_owner)); end if;

  if action = 'password' then
    v_pw := coalesce(a->>'password', '');
    if char_length(v_pw) < 6 then return kw_err(400, 'Use at least 6 characters for the password.'); end if;
    update kw_users set pw = crypt(v_pw, gen_salt('bf', 8)) where username = me_user;
    delete from kw_sessions where username = me_user and kw_sessions.token <> kw_api.token;
    return '{"ok":true}';
  end if;

  if action like 'user%' and not me_owner then return kw_err(403, 'Only the owner can manage hosts.'); end if;

  if action = 'users' then
    return jsonb_build_object('users', coalesce((select jsonb_agg(jsonb_build_object('username', u.username, 'owner', u.owner,
      'quizzes', (select count(*) from kw_quizzes z where z.owner = u.username), 'createdAt', u.created_at) order by u.owner desc, u.created_at)
      from kw_users u), '[]'));
  end if;

  if action = 'user-add' then
    v_user := lower(btrim(coalesce(a->>'username', ''))); v_pw := coalesce(a->>'password', '');
    if v_user !~ '^[a-z0-9._-]{3,20}$' then return kw_err(400, 'Username: 3 to 20 letters or numbers (no spaces).'); end if;
    if char_length(v_pw) < 6 then return kw_err(400, 'Use at least 6 characters for the password.'); end if;
    if (select count(*) from kw_users) >= 20 then return kw_err(409, 'That is enough hosts (20).'); end if;
    insert into kw_users (username, pw, owner, created_at) values (v_user, crypt(v_pw, gen_salt('bf', 8)), false, now_ms) on conflict do nothing;
    if not found then return kw_err(409, 'That username is taken.'); end if;
    return '{"ok":true}';
  end if;

  if action = 'user-password' then
    v_user := lower(btrim(coalesce(a->>'username', ''))); v_pw := coalesce(a->>'password', '');
    if char_length(v_pw) < 6 then return kw_err(400, 'Use at least 6 characters for the password.'); end if;
    update kw_users set pw = crypt(v_pw, gen_salt('bf', 8)) where username = v_user;
    if not found then return kw_err(404, 'No host with that username.'); end if;
    if v_user <> me_user then delete from kw_sessions where username = v_user; end if;
    return '{"ok":true}';
  end if;

  if action = 'user-delete' then
    v_user := lower(btrim(coalesce(a->>'username', '')));
    if v_user = me_user then return kw_err(400, 'You can''t remove yourself.'); end if;
    delete from kw_users where username = v_user and not owner;
    if not found then return kw_err(404, 'No host with that username.'); end if;
    -- their quizzes move to you, so nothing is lost
    update kw_quizzes set owner = me_user where owner = v_user;
    update kw_games set owner = me_user where owner = v_user;
    return '{"ok":true}';
  end if;

  if action = 'quizzes' then
    return jsonb_build_object('quizzes', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'data', data, 'updatedAt', updated_at) order by updated_at desc)
      from kw_quizzes where owner = me_user), '[]'));
  end if;

  if action = 'quiz-save' then
    if jsonb_typeof(a->'data'->'questions') <> 'array' or jsonb_array_length(a->'data'->'questions') = 0 then return kw_err(400, 'Add at least one question.'); end if;
    if length((a->'data')::text) > 400000 then return kw_err(400, 'This quiz is too big.'); end if;
    v_id := coalesce(a->>'id', '');
    if v_id <> '' then
      update kw_quizzes set data = a->'data', updated_at = now_ms where id = v_id and owner = me_user;
      if not found then return kw_err(404, 'Quiz not found.'); end if;
    else
      v_id := kw_id(8);
      insert into kw_quizzes (id, data, owner, created_at, updated_at) values (v_id, a->'data', me_user, now_ms, now_ms);
    end if;
    return jsonb_build_object('id', v_id);
  end if;

  if action = 'quiz-delete' then
    delete from kw_quizzes where id = coalesce(a->>'id', '') and owner = me_user;
    return '{"ok":true}';
  end if;

  if action = 'game-create' then
    select data into t from kw_quizzes where id = coalesce(a->>'quizId', '') and owner = me_user;
    if t is null then return kw_err(404, 'Quiz not found.'); end if;
    -- clear out games older than two days
    delete from kw_answers where kw_answers.pin in (select kw_games.pin from kw_games where created_at < now_ms - 2 * 86400000);
    delete from kw_players where kw_players.pin in (select kw_games.pin from kw_games where created_at < now_ms - 2 * 86400000);
    delete from kw_games where created_at < now_ms - 2 * 86400000;
    for n in 1 .. 20 loop
      v_id := (100000 + floor(random() * 900000)::int)::text;
      insert into kw_games (pin, quiz_id, quiz, state, owner, created_at)
        values (v_id, a->>'quizId', t, '{"phase":"lobby","q":-1,"v":1}', me_user, now_ms) on conflict do nothing;
      if found then return jsonb_build_object('pin', v_id); end if;
    end loop;
    return kw_err(503, 'Could not make a PIN. Try again.');
  end if;

  if action in ('host-state', 'host', 'results') then
    select * into g from kw_games where kw_games.pin = pin_ and owner = me_user for update;
    if not found then return kw_err(404, 'Game not found.'); end if;
    st := g.state; qs := g.quiz->'questions'; qi := (st->>'q')::int;
  end if;

  if action = 'host-state' then
    return jsonb_build_object('pin', pin_, 'quizId', g.quiz_id, 'quiz', g.quiz, 'state', st, 'serverNow', now_ms,
      'players', coalesce((select jsonb_agg(jsonb_build_object('id', p2.id, 'name', p2.name, 'avatar', p2.avatar, 'score', p2.score, 'streak', p2.streak,
        'react', p2.react, 'react_at', p2.react_at, 'answered', exists (select 1 from kw_answers x where x.pin = pin_ and x.player_id = p2.id and x.q = qi)) order by p2.joined_at)
        from kw_players p2 where p2.pin = pin_), '[]'));
  end if;

  if action = 'results' then
    return jsonb_build_object('quiz', g.quiz, 'orders', coalesce(st->'orders', '{}'),
      'players', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'avatar', avatar, 'score', score) order by score desc, joined_at) from kw_players where kw_players.pin = pin_), '[]'),
      'answers', coalesce((select jsonb_agg(jsonb_build_object('player_id', player_id, 'q', x.q, 'answer', answer, 'correct', x.correct, 'points', x.points, 'ms', x.ms)) from kw_answers x where x.pin = pin_), '[]'));
  end if;

  if action = 'host' then
    if a->>'do' = 'next' then
      -- ranks before this question, for the arrows on the next leaderboard
      st := st || jsonb_build_object('ranks', coalesce((select jsonb_object_agg(id, rk) from (select id, row_number() over (order by score desc, joined_at) as rk from kw_players where kw_players.pin = pin_) z), '{}'));
      if qi + 1 >= jsonb_array_length(qs) then
        st := st || jsonb_build_object('phase', 'podium', 'top', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'avatar', avatar, 'score', score) order by score desc, joined_at)
          from (select * from kw_players where kw_players.pin = pin_ order by score desc, joined_at limit 10) z), '[]'));
      else
        qi := qi + 1; q := qs->qi;
        st := (st - 'stats' - 'order') || jsonb_build_object('phase', 'question', 'q', qi, 'startAt', now_ms + 4000,
          'endAt', now_ms + 4000 + coalesce((q->>'time')::numeric, 20) * 1000);
        if q->>'type' = 'order' then
          t := kw_shuffle(jsonb_array_length(coalesce(q->'items', '[]')));
          st := st || jsonb_build_object('order', t, 'orders', coalesce(st->'orders', '{}') || jsonb_build_object(qi::text, t));
        end if;
      end if;
    elsif a->>'do' = 'reveal' then
      if st->>'phase' <> 'question' then return jsonb_build_object('state', st); end if;
      q := qs->qi;
      st := st || jsonb_build_object('phase', 'reveal', 'endAt', least((st->>'endAt')::bigint, now_ms), 'stats', kw_stats(q, pin_, qi));
      -- no right answer this time: the streak is broken
      if q->>'type' = any(scored) then
        update kw_players set streak = 0 where kw_players.pin = pin_
          and id not in (select player_id from kw_answers x where x.pin = pin_ and x.q = qi and x.correct);
      end if;
    elsif a->>'do' = 'leaderboard' then
      prev := coalesce(st->'ranks', '{}');
      st := st || jsonb_build_object('phase', 'leaderboard', 'top', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'avatar', avatar, 'score', score, 'streak', streak,
          'move', case when prev ? id then (prev->>id)::int - rk else 0 end) order by rk)
        from (select *, row_number() over (order by score desc, joined_at) as rk from kw_players where kw_players.pin = pin_) z where rk <= 5), '[]'));
    elsif a->>'do' = 'end' then
      st := st || jsonb_build_object('phase', 'podium', 'top', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'avatar', avatar, 'score', score) order by score desc, joined_at)
        from (select * from kw_players where kw_players.pin = pin_ order by score desc, joined_at limit 10) z), '[]'));
    elsif a->>'do' = 'theme' then
      st := st || jsonb_build_object('theme', case when a->>'theme' = 'night' then 'night' else 'day' end);
    elsif a->>'do' in ('lock', 'unlock') then
      st := st || jsonb_build_object('locked', a->>'do' = 'lock');
    elsif a->>'do' = 'kick' then
      delete from kw_answers where kw_answers.pin = pin_ and player_id = coalesce(a->>'pid', '');
      delete from kw_players where kw_players.pin = pin_ and id = coalesce(a->>'pid', '');
    else
      return kw_err(400, 'Unknown command.');
    end if;
    st := st || jsonb_build_object('v', coalesce((st->>'v')::int, 0) + 1);
    update kw_games set state = st where kw_games.pin = pin_;
    return jsonb_build_object('state', st, 'serverNow', now_ms);
  end if;

  return kw_err(404, 'Unknown action.');
end $$;

-- Only kw_api is reachable from the browser.
do $$ declare f record; begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace s on s.oid = p.pronamespace
           where s.nspname = 'public' and p.proname like 'kw\_%' loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;
grant execute on function public.kw_api(text, jsonb, text) to anon, authenticated;
