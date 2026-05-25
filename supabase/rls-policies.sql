-- CareerCompass Row Level Security policies
-- Apply after base schema. Service role bypasses RLS for API routes.

alter table students enable row level security;
alter table game_results enable row level security;
alter table community_posts enable row level security;
alter table post_likes enable row level security;
alter table chat_sessions enable row level security;
alter table roadmaps enable row level security;
alter table career_interests enable row level security;
alter table parent_links enable row level security;
alter table mentor_bookings enable row level security;
alter table timetables enable row level security;
alter table leaderboard enable row level security;
alter table contact_messages enable row level security;
alter table subscriptions enable row level security;
alter table email_subscribers enable row level security;
alter table notifications enable row level security;
alter table analytics_events enable row level security;

-- Students: read/update own row when authenticated
create policy "students_select_own" on students
  for select using (auth.uid() = auth_id);

create policy "students_update_own" on students
  for update using (auth.uid() = auth_id);

create policy "students_insert_own" on students
  for insert with check (auth.uid() = auth_id);

-- Game results
create policy "game_results_select_own" on game_results
  for select using (
    student_id in (select id from students where auth_id = auth.uid())
  );

create policy "game_results_insert_own" on game_results
  for insert with check (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Community posts: public read, insert with matching student
create policy "community_posts_select_all" on community_posts
  for select using (true);

create policy "community_posts_insert_own" on community_posts
  for insert with check (
    student_id is null
    or student_id in (select id from students where auth_id = auth.uid())
  );

-- Post likes
create policy "post_likes_own" on post_likes
  for all using (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Chat sessions
create policy "chat_sessions_own" on chat_sessions
  for all using (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Roadmaps
create policy "roadmaps_own" on roadmaps
  for all using (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Career interests
create policy "career_interests_own" on career_interests
  for all using (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Parent links (token-based access via service role API)
create policy "parent_links_select_token" on parent_links
  for select using (true);

-- Mentor bookings
create policy "mentor_bookings_insert" on mentor_bookings
  for insert with check (true);

-- Timetables
create policy "timetables_own" on timetables
  for all using (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Leaderboard public read
create policy "leaderboard_select_all" on leaderboard
  for select using (true);

-- Contact messages: insert only (no client read)
create policy "contact_insert" on contact_messages
  for insert with check (true);

-- Subscriptions: own student only
create policy "subscriptions_own" on subscriptions
  for select using (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Email subscribers: insert only
create policy "email_subscribers_insert" on email_subscribers
  for insert with check (true);

-- Notifications
create policy "notifications_own" on notifications
  for select using (
    student_id in (select id from students where auth_id = auth.uid())
  );

-- Analytics: no direct client writes (service role only)
create policy "analytics_deny_client" on analytics_events
  for all using (false);
