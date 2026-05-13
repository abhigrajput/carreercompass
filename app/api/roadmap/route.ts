import { askDeepSeek } from "@/lib/deepseek";
import type { LocaleCode, RoadmapPayload, RoadmapPhase } from "@/types";

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const body = (await req.json()) as {
      career?: { id: string; name: string; domain: string };
      studentClass?: "10" | "11" | "12";
      city?: string;
      language?: LocaleCode;
    };

    if (!body.career?.name) {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }

    const career = body.career;
    const studentClass = body.studentClass ?? "10";
    const city = body.city ?? "bengaluru";
    const lang = body.language ?? "en";

    const langLabel =
      lang === "kn" ? "Kannada" : lang === "hi" ? "Hindi" : "English";

    const prompt = `Create a structured 90‑day roadmap JSON for a Karnataka student in class ${studentClass} living in/near ${city}, aiming for career "${career.name}" (${career.domain}).
Respond ONLY with compact JSON matching this TypeScript shape:
{
  "headline": string,
  "phases": Array<{ "title": string, "weeks": "Weeks 1–4" | "Weeks 5–8" | "Weeks 9–12", "bullets": string[] }>,
  "closingNote": string
}
Rules:
- Language for all strings: ${langLabel}.
- Exactly 3 phases with those week labels in order: Foundation (Weeks 1–4), Exploration (Weeks 5–8), Action (Weeks 9–12).
- Each phase must have 4 or 5 bullets (specific action items).
- Mention Karnataka resources (YouTube, PU colleges, CET/NEET/JEE as relevant).`;

    try {
      const raw = await askDeepSeek(
        [{ role: "user", content: prompt }],
      );

      let roadmap: RoadmapPayload | null = null;
      try {
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        const jsonSlice =
          start >= 0 && end >= start ? raw.slice(start, end + 1) : raw;
        roadmap = JSON.parse(jsonSlice) as RoadmapPayload;
      } catch {
        roadmap = null;
      }

      if (!roadmap || !roadmap.phases?.length) {
        const fallbackPhases: RoadmapPhase[] = [
          {
            title: "Foundation",
            weeks: "Weeks 1–4",
            bullets: [
              "Daily focused study blocks",
              "NCERT essentials",
              "Weekly revision notes",
              "Ask one teacher for feedback weekly",
            ],
          },
          {
            title: "Exploration",
            weeks: "Weeks 5–8",
            bullets: [
              "YouTube mentors",
              "Career interviews",
              "Mini projects",
              "Visit one college website weekly",
            ],
          },
          {
            title: "Action",
            weeks: "Weeks 9–12",
            bullets: [
              "Past papers",
              "College research",
              "Skill sprint",
              "Peer study circle",
            ],
          },
        ];
        roadmap = {
          headline: `${career.name} · 90‑day sprint`,
          phases: fallbackPhases,
          closingNote: raw.slice(0, 280),
        };
      }

      return Response.json({ roadmap });
    } catch (apiErr) {
      console.error("DeepSeek API error:", apiErr);
      const msg =
        apiErr instanceof Error ? apiErr.message : "AI request failed. Try again.";
      return Response.json(
        { error: `Could not generate roadmap: ${msg}` },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Roadmap failed. Please try again." },
      { status: 500 },
    );
  }
}
