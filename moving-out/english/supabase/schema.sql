-- English site database (Class Games and game packs). Run once in Supabase:
-- SQL Editor, New query, paste all of this, Run. Running it again is safe.
--
-- The site has one shared game library, so every device sees the same games.
-- Pages send all their games on each sync; each game is last-write-wins on
-- updatedAt, and deletes are kept as tombstones so they spread to other devices.
-- The table is locked; the browser can only use the cg_sync function.

create table if not exists public.cg_games (
  library    text not null,
  id         text not null,
  data       jsonb,
  updated_at bigint not null,
  deleted    boolean not null default false,
  primary key (library, id)
);
alter table public.cg_games enable row level security;

create or replace function public.cg_sync(library text, games jsonb default '[]')
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
#variable_conflict use_column
declare
  lib text := cg_sync.library;
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  rows jsonb;
begin
  -- "games" is the Class Games page, "stop" older Stop! category sets, "fun" the game packs
  if lib is null or lib not in ('games', 'stop', 'fun') then return jsonb_build_object('error', 'Unknown library.', 'status', 400); end if;
  if jsonb_typeof(games) <> 'array' then games := '[]'; end if;
  if jsonb_array_length(games) > 600 then return jsonb_build_object('error', 'Too many games.', 'status', 400); end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', g->>'id',
      -- a device clock running ahead must not make its copy win forever
      'updated_at', least(greatest(1, floor(case when jsonb_typeof(g->'updatedAt') = 'number' then (g->>'updatedAt')::numeric else 1 end)), now_ms + 60000),
      'deleted', g->'deleted' = 'true'::jsonb,
      'data', case when g->'deleted' = 'true'::jsonb then null else g->'data' end)), '[]')
    into rows
    from jsonb_array_elements(games) g
    where coalesce(g->>'id', '') ~ '^[A-Za-z0-9_-]{1,40}$'
      and (g->'deleted' = 'true'::jsonb or jsonb_typeof(g->'data') = 'object');
  if exists (select 1 from jsonb_array_elements(rows) r where length((r->'data')::text) > 100000) then
    return jsonb_build_object('error', 'One of the games is too big to save online.', 'status', 400);
  end if;
  if (select count(*) from jsonb_array_elements(rows) r where not (r->>'deleted')::boolean) > 300 then
    return jsonb_build_object('error', 'You can save up to 300 games online.', 'status', 400);
  end if;
  insert into cg_games as c (library, id, data, updated_at, deleted)
    select lib, r->>'id', r->'data', (r->>'updated_at')::bigint, (r->>'deleted')::boolean from jsonb_array_elements(rows) r
    on conflict (library, id) do update set data = excluded.data, updated_at = excluded.updated_at, deleted = excluded.deleted
      where c.updated_at < excluded.updated_at;
  return jsonb_build_object('games', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'data', data, 'updatedAt', updated_at, 'deleted', deleted) order by updated_at)
    from cg_games c where c.library = lib), '[]'));
end $$;

revoke all on function public.cg_sync(text, jsonb) from public, anon, authenticated;
grant execute on function public.cg_sync(text, jsonb) to anon, authenticated;
