-- CareerCompass schema v3: timetables, community, mentors, school name

alter table students add column if not exists school_name text;

create table if not exists timetables (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  career_id text not null,
  exam_name text not null,
  exam_date date,
  hours_per_day integer,
  timetable_data jsonb not null,
  created_at timestamp with time zone default now()
);

create table if not exists community_posts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  student_name text not null,
  student_city text not null,
  content text not null,
  post_type text not null,
  career_tag text,
  likes integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references community_posts(id) on delete cascade,
  student_id uuid references students(id),
  created_at timestamp with time zone default now(),
  unique(post_id, student_id)
);

create table if not exists mentors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  career text not null,
  company text,
  city text not null,
  experience_years integer,
  languages text[],
  bio text,
  price_per_session integer default 199,
  available boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists mentor_bookings (
  id uuid default gen_random_uuid() primary key,
  mentor_id uuid references mentors(id),
  student_id uuid references students(id),
  student_name text not null,
  student_email text,
  preferred_date date,
  message text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

alter table timetables enable row level security;
alter table community_posts enable row level security;
alter table post_likes enable row level security;
alter table mentors enable row level security;
alter table mentor_bookings enable row level security;

-- Service role bypasses RLS; add fine-grained policies in Supabase dashboard for direct client access.

insert into mentors (name, career, company, city, experience_years, languages, bio, price_per_session)
values
  ('Priya Sharma', 'Software Engineer', 'Infosys Bengaluru', 'Bengaluru', 5, array['Kannada','English','Hindi'], 'VTU graduate, now at Infosys. Helps students navigate engineering + placement preparation.', 199),
  ('Dr. Ramesh Kumar', 'Doctor (MBBS)', 'Manipal Hospital', 'Bengaluru', 8, array['Kannada','English'], 'MBBS from Bangalore Medical College. Guides NEET aspirants from Karnataka.', 299),
  ('Kavitha Nair', 'UX Designer', 'Byju''s', 'Bengaluru', 4, array['Kannada','English'], 'Self-taught designer. Helps students build portfolios without engineering degree.', 199),
  ('Suresh Patil', 'IAS Officer', 'Karnataka Government', 'Hubballi', 12, array['Kannada','Hindi','English'], 'UPSC 2011 batch. Guides rural Karnataka students on civil services preparation.', 399),
  ('Ananya Reddy', 'CA', 'Deloitte', 'Bengaluru', 6, array['Kannada','Telugu','English'], 'CA in 3 attempts. Guides commerce students through CA Foundation and Inter.', 199),
  ('Vijay Gowda', 'Game Developer', 'Junglee Games', 'Bengaluru', 3, array['Kannada','English'], 'Started coding at 16. Now building games. Helps students enter the gaming industry.', 149);
