/** Client helper: updates streak via API (uses service role on server). */
export async function updateStreak(studentId: string): Promise<{
  streakDays: number;
  isNewRecord: boolean;
  badgeAwarded: string | null;
}> {
  try {
    const res = await fetch("/api/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    const data = (await res.json()) as {
      streakDays?: number;
      isNewRecord?: boolean;
      badgeAwarded?: string | null;
    };
    return {
      streakDays: data.streakDays ?? 1,
      isNewRecord: Boolean(data.isNewRecord),
      badgeAwarded: data.badgeAwarded ?? null,
    };
  } catch {
    return { streakDays: 1, isNewRecord: false, badgeAwarded: null };
  }
}
