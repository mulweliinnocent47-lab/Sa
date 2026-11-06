-- ════════════════════════════════════════════════════════════════════
--  SA Student: database setup
--  Supabase dashboard → SQL Editor → New query → paste ALL of this → Run.
--  It is safe to run more than once.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. PROFILES  (columns match PROFILE_FIELDS in lib/profileConfig.js) ──
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  full_name  text,
  grade      int  check (grade between 8 and 12),
  school     text,
  province   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_username_key on public.profiles (lower(username));

alter table public.profiles enable row level security;
drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles read own"   on public.profiles for select using (auth.uid() = user_id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 2. STUDY EVENTS  (written only by the server with the service-role key) ──
create table if not exists public.user_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists user_events_user_time on public.user_events (user_id, created_at desc);
alter table public.user_events enable row level security;
drop policy if exists "events read own" on public.user_events;
create policy "events read own" on public.user_events for select using (auth.uid() = user_id);

-- ── 3. XP AWARDS  (one row per task per day/week; the unique key stops double XP) ──
create table if not exists public.task_awards (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  task_key   text not null,
  period_key text not null,
  xp         int  not null check (xp > 0),
  created_at timestamptz not null default now(),
  unique (user_id, task_key, period_key)
);
create index if not exists task_awards_user on public.task_awards (user_id, created_at desc);
alter table public.task_awards enable row level security;
drop policy if exists "awards read own" on public.task_awards;
create policy "awards read own" on public.task_awards for select using (auth.uid() = user_id);

-- ── 4. PRACTICE RESULTS  (feeds Progress + Exam Centre stats) ──
create table if not exists public.practice_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  session_id   text not null,
  title        text,
  subject      text,
  topic        text,
  level        text,
  score        int  not null,
  total_marks  int  not null,
  percent      int  not null,
  seconds_used int,
  questions    int,
  answered     int,
  created_at   timestamptz not null default now()
);
create index if not exists practice_results_user on public.practice_results (user_id, created_at desc);
alter table public.practice_results enable row level security;
drop policy if exists "results read own" on public.practice_results;
create policy "results read own" on public.practice_results for select using (auth.uid() = user_id);

-- ── 5. PLANNER  (you already have this table: this only adds what is missing) ──
create table if not exists public.planner (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject    text not null,
  topic      text not null,
  time       text not null,
  level      text not null,
  done       boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.planner add column if not exists done boolean not null default false;
alter table public.planner enable row level security;
drop policy if exists "planner read own"   on public.planner;
drop policy if exists "planner insert own" on public.planner;
drop policy if exists "planner update own" on public.planner;
drop policy if exists "planner delete own" on public.planner;
create policy "planner read own"   on public.planner for select using (auth.uid() = user_id);
create policy "planner insert own" on public.planner for insert with check (auth.uid() = user_id);
create policy "planner update own" on public.planner for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "planner delete own" on public.planner for delete using (auth.uid() = user_id);

-- ── 6. PUSH NOTIFICATION SUBSCRIPTIONS ──
create table if not exists public.push_subscriptions (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  pref_daily  boolean not null default true,
  pref_weekly boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push read own"   on public.push_subscriptions;
drop policy if exists "push insert own" on public.push_subscriptions;
drop policy if exists "push update own" on public.push_subscriptions;
drop policy if exists "push delete own" on public.push_subscriptions;
create policy "push read own"   on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "push insert own" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push update own" on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push delete own" on public.push_subscriptions for delete using (auth.uid() = user_id);

-- ── 7. LEADERBOARD  (security definer: it can read everyone's XP but returns ONLY username, grade and XP) ──
create or replace function public.get_leaderboard(period text default 'all', max_rows int default 50)
returns table (rank bigint, user_id uuid, username text, grade int, xp bigint)
language sql
stable
security definer
set search_path = public
as $$
  with scoped as (
    select a.user_id, sum(a.xp)::bigint as xp
    from public.task_awards a
    where case period
            when 'day'  then a.created_at >= (date_trunc('day',  now() at time zone 'Africa/Johannesburg') at time zone 'Africa/Johannesburg')
            when 'week' then a.created_at >= (date_trunc('week', now() at time zone 'Africa/Johannesburg') at time zone 'Africa/Johannesburg')
            else true
          end
    group by a.user_id
  )
  select row_number() over (order by s.xp desc, p.created_at asc) as rank,
         p.user_id, p.username, p.grade, s.xp
  from scoped s
  join public.profiles p on p.user_id = s.user_id
  order by s.xp desc, p.created_at asc
  limit greatest(1, least(max_rows, 100));
$$;
grant execute on function public.get_leaderboard(text, int) to anon, authenticated;
