import { askDeepSeek } from "@/lib/deepseek";
import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { sanitizeUserText } from "@/lib/security/prompt-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { TimetablePayload } from "@/lib/timetable-types";
import { TimetableSchema } from "@/lib/validation";

function parseTimetableJson(raw: string): TimetablePayload | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const slice = start >= 0 && end >= start ? raw.slice(start, end + 1) : raw;
  try {
    const parsed = JSON.parse(slice) as TimetablePayload;
    if (parsed?.weeks && Array.isArray(parsed.weeks)) {
      return parsed;
    }
  } catch {
    /* */
  }
  return null;
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 8);
  if (limited) return limited;

  const parsed = await parseBody(req, TimetableSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const body = parsed.data;
    const careerLabel = sanitizeUserText(body.careerLabel ?? body.careerId, 120);
    const examName = sanitizeUserText(body.examName, 40);
    const examDate = body.examDate;
    const { hoursPerDay, weakSubjects, strongSubjects, careerId, studentId } = body;

    const fallbackInput = {
      careerLabel,
      examName,
      hoursPerDay,
      weakSubjects,
      strongSubjects,
    };

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json(
        { error: "AI not configured", timetable: fallbackTimetable(fallbackInput) },
        { status: 200 },
      );
    }

    const prompt = `Create a day-by-day study timetable for a Karnataka student targeting ${careerLabel} via ${examName} with exam date ${examDate}.
Available study hours per day: ${hoursPerDay}.
Weak subjects: ${weakSubjects.join(", ") || "none listed"}.
Strong subjects: ${strongSubjects.join(", ") || "none listed"}.

Return ONLY valid JSON in this exact shape (no markdown, no commentary):
{"weeks":[{"week":1,"days":[{"day":"Monday","subjects":[{"subject":"Physics","duration":"90 min","topics":["topic"],"resources":["NCERT"]}]}]}]}

Include 2 weeks minimum, Monday–Sunday each week, realistic Karnataka board + exam prep mix.`;

    const raw = await askDeepSeek(
      [{ role: "user", content: prompt }],
      "You output only compact JSON for study timetables.",
    );

    const timetable = parseTimetableJson(raw) ?? fallbackTimetable(fallbackInput);

    const admin = createServiceRoleClient();
    if (admin && studentId) {
      try {
        await admin.from("timetables").insert({
          student_id: studentId,
          career_id: careerId || careerLabel,
          exam_name: examName,
          exam_date: examDate,
          hours_per_day: hoursPerDay,
          timetable_data: timetable,
        });
      } catch (e) {
        console.error("timetable save", e);
      }
    }

    return Response.json({ timetable });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to generate timetable" }, { status: 500 });
  }
}

function fallbackTimetable(body: {
  careerLabel: string;
  examName: string;
  hoursPerDay: number;
  weakSubjects: string[];
  strongSubjects: string[];
}): TimetablePayload {
  const weak = body.weakSubjects[0] ?? "Core subjects";
  const strong = body.strongSubjects[0] ?? "Revision";
  return {
    weeks: [
      {
        week: 1,
        days: [
          {
            day: "Monday",
            subjects: [
              {
                subject: weak,
                duration: `${Math.min(body.hoursPerDay, 4) * 45} min`,
                topics: ["Foundations", "NCERT reading"],
                resources: ["NCERT", `${body.examName} syllabus`],
              },
              {
                subject: strong,
                duration: `${Math.max(30, body.hoursPerDay * 15)} min`,
                topics: ["Quick revision"],
                resources: ["Previous papers"],
              },
            ],
          },
          {
            day: "Tuesday",
            subjects: [
              {
                subject: weak,
                duration: `${body.hoursPerDay * 40} min`,
                topics: ["Practice set"],
                resources: ["YouTube — exam-specific playlist"],
              },
            ],
          },
        ],
      },
    ],
  };
}
