create table if not exists mock_interviews (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  career_id text not null,
  questions jsonb not null default '[]',
  answers jsonb not null default '[]',
  scores jsonb not null default '[]',
  overall_score integer,
  created_at timestamp with time zone default now()
);

create table if not exists career_news (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  news_data jsonb not null,
  created_at timestamp with time zone default now()
);

create table if not exists study_sessions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  subject text not null,
  duration_minutes integer not null,
  session_date date default current_date,
  created_at timestamp with time zone default now()
);

create table if not exists study_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  career_focus text not null,
  city text not null,
  creator_id uuid references students(id),
  max_members integer default 10,
  created_at timestamp with time zone default now()
);

create table if not exists group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references study_groups(id) on delete cascade,
  student_id uuid references students(id),
  joined_at timestamp with time zone default now(),
  unique(group_id, student_id)
);

create table if not exists weekly_challenges (
  id uuid default gen_random_uuid() primary key,
  week_start date not null unique,
  theme text not null,
  career_focus text not null,
  tasks jsonb not null,
  created_at timestamp with time zone default now()
);

create table if not exists challenge_completions (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references weekly_challenges(id),
  student_id uuid references students(id),
  tasks_completed jsonb default '[]',
  points_earned integer default 0,
  completed_at timestamp with time zone,
  unique(challenge_id, student_id)
);

create table if not exists cache_store (
  key text primary key,
  value jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists ip_blocklist (
  id uuid default gen_random_uuid() primary key,
  ip_address text not null unique,
  reason text,
  blocked_at timestamp with time zone default now()
);

create table if not exists partners (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  type text not null,
  city text,
  referral_code text unique default upper(
    substring(gen_random_uuid()::text, 1, 10)
  ),
  total_referrals integer default 0,
  total_earnings integer default 0,
  created_at timestamp with time zone default now()
);

alter table mock_interviews enable row level security;
alter table career_news enable row level security;
alter table study_sessions enable row level security;
alter table study_groups enable row level security;
alter table group_members enable row level security;
alter table weekly_challenges enable row level security;
alter table challenge_completions enable row level security;
alter table cache_store enable row level security;
alter table ip_blocklist enable row level security;
alter table partners enable row level security;
