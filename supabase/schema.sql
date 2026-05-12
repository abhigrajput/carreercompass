-- CareerCompass Karnataka — Supabase schema
-- Run this in the Supabase SQL editor.

-- Students table
create table if not exists students (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  class text not null, -- '10', '11', '12'
  city text not null, -- 'bengaluru', 'mysuru', 'hubballi'
  language text default 'en', -- 'en', 'kn', 'hi'
  email text unique,
  phone text,
  auth_id uuid references auth.users(id),
  known_goal text, -- if student knows their goal
  stream text -- 'science', 'commerce', 'arts'
);

-- Career interests (what student explored)
create table if not exists career_interests (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  career_id text not null,
  career_name text not null,
  interest_score integer default 0, -- 0-100
  created_at timestamp with time zone default now()
);

-- Game results
create table if not exists game_results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  career_domain text not null, -- 'engineering', 'medicine', 'tech', etc.
  score integer not null, -- 0-100
  total_questions integer not null,
  correct_answers integer not null,
  played_at timestamp with time zone default now()
);

-- AI chat sessions
create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  messages jsonb default '[]',
  career_suggestions jsonb default '[]',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Student roadmaps
create table if not exists roadmaps (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  career_id text not null,
  career_name text not null,
  roadmap_data jsonb not null, -- AI-generated 90-day plan
  created_at timestamp with time zone default now()
);

-- Karnataka colleges
create table if not exists colleges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  city text not null,
  type text not null, -- 'government', 'private', 'aided'
  streams text[] not null, -- ['science', 'commerce', 'arts']
  careers text[] not null, -- which careers this college leads to
  cet_cutoff_general integer,
  cet_cutoff_sc integer,
  cet_cutoff_st integer,
  website text,
  ranking integer
);

-- Parent links
create table if not exists parent_links (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  share_token text unique default gen_random_uuid()::text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table students enable row level security;
alter table career_interests enable row level security;
alter table game_results enable row level security;
alter table chat_sessions enable row level security;
alter table roadmaps enable row level security;
alter table colleges enable row level security;
alter table parent_links enable row level security;

-- RLS Policies (authenticated students own rows)
create policy "Students can read own data" on students for select using (auth.uid() = auth_id);
create policy "Students can insert own data" on students for insert with check (auth.uid() = auth_id);
create policy "Students can update own data" on students for update using (auth.uid() = auth_id);

create policy "Students read interests" on career_interests for select using (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);
create policy "Students insert interests" on career_interests for insert with check (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);

create policy "Students read game results" on game_results for select using (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);
create policy "Students insert game results" on game_results for insert with check (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);

create policy "Students read chats" on chat_sessions for select using (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);
create policy "Students insert chats" on chat_sessions for insert with check (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);
create policy "Students update chats" on chat_sessions for update using (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);

create policy "Students read roadmaps" on roadmaps for select using (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);
create policy "Students insert roadmaps" on roadmaps for insert with check (
  exists (select 1 from students s where s.id = student_id and s.auth_id = auth.uid())
);

-- Colleges are reference data — readable by any authenticated user
create policy "Colleges readable" on colleges for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Parent links: token-based reads can be handled via service role / Edge Functions in production
create policy "Parent links admin service" on parent_links for all using (false) with check (false);

-- Seed 20 Karnataka colleges (abbreviated representative rows)
insert into colleges (name, city, type, streams, careers, cet_cutoff_general, cet_cutoff_sc, cet_cutoff_st, website, ranking)
values
  ('RV College of Engineering', 'Bengaluru', 'private', array['science']::text[], array['software-engineer','mechanical-engineer']::text[], 4200, 11000, 24000, 'https://www.rvce.edu.in/', 12),
  ('BMS College of Engineering', 'Bengaluru', 'private', array['science']::text[], array['civil-engineer','electrical-engineer']::text[], 5100, 12500, 26000, 'https://bmsce.ac.in/', 18),
  ('PES University', 'Bengaluru', 'private', array['science','commerce']::text[], array['software-engineer','data-scientist']::text[], 3800, 9800, 22000, 'https://pes.edu/', 15),
  ('NITK Surathkal', 'Surathkal', 'government', array['science']::text[], array['software-engineer','civil-engineer']::text[], 2800, 7600, 18000, 'https://www.nitk.ac.in/', 5),
  ('IIIT Bangalore', 'Bengaluru', 'government', array['science']::text[], array['software-engineer','cybersecurity-analyst']::text[], 2100, 5200, 13000, 'https://www.iiitb.ac.in/', 8),
  ('Bangalore Medical College', 'Bengaluru', 'government', array['science']::text[], array['doctor','nurse']::text[], 900, 6400, 16000, 'https://www.bmcrib.org/', 6),
  ('St. Johns Medical College', 'Bengaluru', 'private', array['science']::text[], array['doctor']::text[], 1400, 8100, 19000, 'https://www.stjohns.in/', 11),
  ('Manipal Institute of Technology', 'Manipal', 'private', array['science']::text[], array['software-engineer','game-developer']::text[], 4500, 11800, 25000, 'https://manipal.edu/mit.html', 14),
  ('University of Mysore', 'Mysuru', 'government', array['science','commerce','arts']::text[], array['teacher','economist']::text[], 25000, 42000, 65000, 'https://uni-mysore.ac.in/', 70),
  ('National Institute of Engineering', 'Mysuru', 'private', array['science']::text[], array['mechanical-engineer']::text[], 9800, 18200, 34000, 'https://nie.ac.in/', 48),
  ('Mysore Medical College', 'Mysuru', 'government', array['science']::text[], array['doctor']::text[], 2200, 9200, 21000, 'https://mmc.mysore.med.gov.in/', 28),
  ('Karnataka Institute of Medical Sciences', 'Hubballi', 'government', array['science']::text[], array['doctor','physiotherapist']::text[], 4800, 12100, 25500, 'https://www.kims-hubli.edu.in/', 44),
  ('BVB College of Engineering & Technology', 'Hubballi', 'aided', array['science']::text[], array['software-engineer']::text[], 14200, 24500, 40000, 'https://www.bvb.edu/', 58),
  ('Christ University', 'Bengaluru', 'private', array['science','commerce','arts']::text[], array['psychologist','journalist']::text[], 12000, 22000, 38000, 'https://christuniversity.in/', 55),
  ('University Visvesvaraya College of Engineering', 'Bengaluru', 'government', array['science']::text[], array['civil-engineer']::text[], 8600, 16800, 32000, 'https://uvce.ac.in/', 38),
  ('Indian Institute of Science', 'Bengaluru', 'government', array['science']::text[], array['data-scientist','biotechnologist']::text[], 150, 450, 900, 'https://www.iisc.ac.in/', 1),
  ('NIFT Bangalore', 'Bengaluru', 'government', array['arts']::text[], array['ux-designer','fashion-designer']::text[], 3200, 8800, 19500, 'https://www.nift.ac.in/bengaluru/', 20),
  ('Karnataka State Law University', 'Hubballi', 'government', array['arts','commerce']::text[], array['lawyer','ias-officer']::text[], 18000, 30000, 45000, 'https://www.kslu.ac.in/', 65),
  ('Ramaiah Medical College', 'Bengaluru', 'private', array['science']::text[], array['doctor','dentist']::text[], 2100, 8800, 20000, 'https://www.msrmc.ac.in/', 24),
  ('SJCE Mysuru', 'Mysuru', 'government', array['science']::text[], array['software-engineer','civil-engineer']::text[], 11200, 19800, 36000, 'https://sjce.ac.in/', 52);
