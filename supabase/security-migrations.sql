-- Run in Supabase SQL editor after schema-v4.sql

alter table analytics_events
  add column if not exists idempotency_key text unique;

create index if not exists idx_analytics_idempotency
  on analytics_events (idempotency_key)
  where idempotency_key is not null;

-- Game session tokens (optional persistent store for multi-instance deploys)
create table if not exists game_sessions (
  token uuid primary key default gen_random_uuid(),
  domain text not null,
  student_id uuid references students(id) on delete set null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  used_at timestamptz
);

create index if not exists idx_game_sessions_expires on game_sessions (expires_at);
