import type { LocaleCode, StudentProfile } from "@/types";

const STORAGE_KEY = "cc_student_profile_v1";

export function loadStudentProfile(): StudentProfile | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  if (typeof window === "undefined") {
    return;
  }
  const next: StudentProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearStudentProfile() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

export function getLanguageFromProfile(
  profile: StudentProfile | null,
): LocaleCode {
  return profile?.language ?? "en";
}
