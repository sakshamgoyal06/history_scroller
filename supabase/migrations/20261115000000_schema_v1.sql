-- Curiosity schema v1 (BUILD_PLAN M0.2, PRD §11.2, NFR-03, D-STACK = Supabase).
-- Content tables are readable by everyone once published and writable only with the service role
-- (Studio, seed). Per-user tables are private: row-level security limits every row to auth.uid().

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- content (public read)
create table public.content_items (
  id            text primary key,
  type          text not null check (type in ('card', 'post', 'story', 'ca_post', 'explainer', 'chapter_card', 'recall')),
  mode_pool     text[] not null default '{curious}' check (mode_pool <@ array['curious', 'upsc']),
  domain        text,
  topics        text[] not null default '{}',
  gs_tags       text[] not null default '{}' check (gs_tags <@ array['GS1', 'GS2', 'GS3', 'GS4']),
  event_date    date,
  region        text,
  level         text,
  body          jsonb not null,
  version       integer not null default 1 check (version >= 1),
  sources       jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  status        text not null default 'draft' check (status in ('draft', 'review', 'published', 'retired')),
  published_at  timestamptz,
  corrections   jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- PRD §5 / §10.3a: nothing is published without at least one source.
  constraint published_needs_sources check (status <> 'published' or jsonb_array_length(sources) > 0),
  constraint published_needs_date check (status <> 'published' or published_at is not null)
);
create index content_items_feed_idx on public.content_items (status, event_date desc);
create index content_items_gs_idx on public.content_items using gin (gs_tags);
create trigger content_items_updated before update on public.content_items
  for each row execute function public.set_updated_at();

create table public.editions (
  id            bigint generated always as identity primary key,
  mode          text not null check (mode in ('curious', 'upsc')),
  edition_date  date not null,
  item_ids      text[] not null default '{}',
  status        text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  publish_at    timestamptz,
  unique (mode, edition_date)
);

create table public.zones (
  id        text primary key,
  title     text not null,
  mode      text not null default 'curious' check (mode in ('curious', 'upsc')),
  item_ids  text[] not null default '{}',
  status    text not null default 'draft' check (status in ('draft', 'published'))
);

-- Learning Zone (FR-UPSC-08..10, D-12): Subject → Chapter, no book names.
create table public.subjects (
  id        text primary key,
  name      text not null,
  gs        text not null check (gs in ('GS1', 'GS2', 'GS3', 'GS4')),
  position  integer not null default 0
);

create table public.chapters (
  id          text primary key,
  subject_id  text not null references public.subjects (id) on delete cascade,
  title       text not null,
  position    integer not null default 0,
  summary     text,
  video       jsonb,
  card_ids    text[] not null default '{}',
  status      text not null default 'draft' check (status in ('draft', 'published')),
  constraint published_chapter_complete check (
    status <> 'published' or (summary is not null and cardinality(card_ids) between 8 and 20)
  )
);

create table public.recall_items (
  id        text primary key,
  item_id   text references public.content_items (id) on delete cascade,
  question  text not null,
  options   jsonb,
  answer    text not null
);

-- ---------------------------------------------------------------- per-user (private)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  mode        text not null default 'curious' check (mode in ('curious', 'upsc')),
  exam        text,
  exam_year   integer,
  language    text not null default 'en',
  interests   text[] not null default '{}',
  region      text,
  plan        text not null default 'free' check (plan in ('free', 'plus')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Every new account gets a profile row.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.saved_items (
  user_id     uuid not null references auth.users (id) on delete cascade,
  item_id     text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table public.user_item_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  item_id     text not null,
  kind        text not null check (kind in ('seen', 'explored', 'saved', 'unsaved', 'known', 'liked', 'not_interested', 'completed')),
  created_at  timestamptz not null default now()
);
create index user_item_events_user_idx on public.user_item_events (user_id, created_at desc);

-- Revision schedule (FR-UPSC-11): key is "<chapterId>#<cardIndex>" or a recall item id.
create table public.recall_state (
  user_id     uuid not null references auth.users (id) on delete cascade,
  recall_key  text not null,
  step        integer not null default 0 check (step >= 0),
  due         date not null,
  history     jsonb not null default '[]'::jsonb,
  primary key (user_id, recall_key)
);
create index recall_state_due_idx on public.recall_state (user_id, due);

create table public.chapter_progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  chapter_id  text not null references public.chapters (id) on delete cascade,
  done_at     timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create table public.paths (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid not null references auth.users (id) on delete cascade,
  request      jsonb not null,
  plan         jsonb,
  share_token  text unique,
  created_at   timestamptz not null default now()
);

create table public.lessons (
  id              uuid primary key default gen_random_uuid(),
  path_id         uuid not null references public.paths (id) on delete cascade,
  owner           uuid not null references auth.users (id) on delete cascade,
  position        integer not null,
  status          text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  content         jsonb,
  sources         jsonb not null default '[]'::jsonb,
  prompt_version  text,
  model           text,
  created_at      timestamptz not null default now(),
  unique (path_id, position)
);

-- ---------------------------------------------------------------- row-level security
alter table public.content_items    enable row level security;
alter table public.editions         enable row level security;
alter table public.zones            enable row level security;
alter table public.subjects         enable row level security;
alter table public.chapters         enable row level security;
alter table public.recall_items     enable row level security;
alter table public.profiles         enable row level security;
alter table public.saved_items      enable row level security;
alter table public.user_item_events enable row level security;
alter table public.recall_state     enable row level security;
alter table public.chapter_progress enable row level security;
alter table public.paths            enable row level security;
alter table public.lessons          enable row level security;

-- Public content: read published rows only. No write policies, so only the service role writes.
create policy "read published content" on public.content_items for select to anon, authenticated
  using (status = 'published');
create policy "read published editions" on public.editions for select to anon, authenticated
  using (status = 'published');
create policy "read published zones" on public.zones for select to anon, authenticated
  using (status = 'published');
create policy "read subjects" on public.subjects for select to anon, authenticated using (true);
create policy "read published chapters" on public.chapters for select to anon, authenticated
  using (status = 'published');
create policy "read recall items" on public.recall_items for select to anon, authenticated using (true);

-- Private rows: the owner can do everything with their own rows and nothing with anyone else's.
create policy "own profile: read" on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "own profile: edit" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own saved items" on public.saved_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own events: read" on public.user_item_events for select to authenticated
  using (user_id = auth.uid());
create policy "own events: add" on public.user_item_events for insert to authenticated
  with check (user_id = auth.uid());
create policy "own recall state" on public.recall_state for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own chapter progress" on public.chapter_progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own paths" on public.paths for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own lessons" on public.lessons for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

-- Table privileges. Supabase grants ALL on new public tables to anon and authenticated by default, which would
-- let a user update their own `plan`. Start from nothing and grant only what each role needs.
revoke all on public.content_items, public.editions, public.zones, public.subjects, public.chapters,
  public.recall_items, public.profiles, public.saved_items, public.user_item_events, public.recall_state,
  public.chapter_progress, public.paths, public.lessons from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.content_items, public.editions, public.zones, public.subjects, public.chapters,
  public.recall_items to anon, authenticated;
-- Profiles are created by the signup trigger; users may edit only their own preferences, never `plan`.
grant select on public.profiles to authenticated;
grant update (mode, exam, exam_year, language, interests, region) on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_items, public.recall_state,
  public.chapter_progress, public.paths, public.lessons to authenticated;
grant select, insert on public.user_item_events to authenticated;
