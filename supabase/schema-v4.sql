-- CareerCompass schema v4: subscriptions, schools, email, errors, notifications, analytics

create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  plan text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount integer not null,
  currency text default 'INR',
  status text default 'pending',
  starts_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists school_subscriptions (
  id uuid default gen_random_uuid() primary key,
  school_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  city text not null,
  student_count integer,
  plan text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount integer,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists school_admins (
  id uuid default gen_random_uuid() primary key,
  school_subscription_id uuid references school_subscriptions(id),
  email text not null unique,
  password_hash text,
  school_name text not null,
  created_at timestamp with time zone default now()
);

create table if not exists email_subscribers (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text not null unique,
  language text default 'en',
  source text,
  subscribed boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists error_logs (
  id uuid default gen_random_uuid() primary key,
  error text,
  url text,
  user_agent text,
  created_at timestamp with time zone default now()
);

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  type text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  event text not null,
  properties jsonb default '{}',
  student_id uuid references students(id),
  created_at timestamp with time zone default now()
);

alter table subscriptions enable row level security;
alter table school_subscriptions enable row level security;
alter table school_admins enable row level security;
alter table email_subscribers enable row level security;
alter table error_logs enable row level security;
alter table notifications enable row level security;
alter table analytics_events enable row level security;
