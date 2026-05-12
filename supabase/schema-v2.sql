-- Schema v2: Streaks, badges, points, referrals, pro status, contact, leaderboard, missions

alter table students add column if not exists points integer default 0;
alter table students add column if not exists streak_days integer default 0;
alter table students add column if not exists last_active date;
alter table students add column if not exists badges jsonb default '[]';
alter table students add column if not exists is_pro boolean default false;
alter table students add column if not exists referral_code text unique
  default upper(substring(gen_random_uuid()::text, 1, 8));
alter table students add column if not exists referred_by text;
alter table students add column if not exists referral_count integer default 0;

create table if not exists daily_missions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  mission_type text not null,
  mission_label text not null,
  completed boolean default false,
  points_earned integer default 0,
  date date default current_date
);

create table if not exists leaderboard (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  student_name text not null,
  city text not null,
  points integer default 0,
  updated_at timestamp with time zone default now()
);

create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  role text not null,
  created_at timestamp with time zone default now()
);

alter table daily_missions enable row level security;
alter table leaderboard enable row level security;
alter table contact_messages enable row level security;
