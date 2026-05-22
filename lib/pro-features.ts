export const PRO_FEATURES = {
  unlimited_chat: true,
  all_games: true,
  roadmap_generator: true,
  timetable_generator: true,
  scholarship_alerts: true,
  parent_dashboard: true,
  badges_and_streaks: true,
  college_mapper_advanced: true,
  community_posting: true,
  mentor_booking_discount: "10%",
} as const;

export const FREE_LIMITS = {
  chat_messages_per_day: 5,
  games_per_day: 1,
  roadmaps_per_month: 1,
  timetables_per_month: 0,
} as const;

export type ProFeatureKey = keyof typeof PRO_FEATURES;

export function isProFeature(feature: ProFeatureKey): boolean {
  const v = PRO_FEATURES[feature];
  return v === true || typeof v === "string";
}

export function getChatCountKey(studentId: string): string {
  return `cc_chat_count_${studentId}_${new Date().toISOString().slice(0, 10)}`;
}

export function getChatCountToday(studentId: string | undefined): number {
  if (typeof window === "undefined" || !studentId) return 0;
  const raw = localStorage.getItem(getChatCountKey(studentId));
  return raw ? Number(raw) : 0;
}

export function incrementChatCount(studentId: string): number {
  const key = getChatCountKey(studentId);
  const next = getChatCountToday(studentId) + 1;
  localStorage.setItem(key, String(next));
  return next;
}
