import { askDeepSeek } from "@/lib/deepseek";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      class?: string;
      city?: string;
      career?: string;
      language?: string;
    };

    const langLabel =
      body.language === "kn"
        ? "Kannada"
        : body.language === "hi"
          ? "Hindi"
          : "English";

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json({
        brief: `Good morning, ${body.name ?? "Student"}! ☀️ Keep exploring careers today — one small step builds your future.`,
      });
    }

    const prompt = `Generate a personalized morning message for ${body.name ?? "Student"}, a Class ${body.class ?? "10"} student from ${body.city ?? "Karnataka"} interested in ${body.career ?? "their future career"}.
Include: 1 motivational line, 1 specific tip for their career goal, 1 reminder about today's mission.
Respond in ${langLabel}. Under 60 words. Warm and encouraging.`;

    const brief = await askDeepSeek(
      [{ role: "user", content: prompt }],
      "You are CareerCompass morning coach.",
    );

    return Response.json({ brief: brief.trim() });
  } catch {
    return Response.json({
      brief: "Good morning! ☀️ Complete one mission today to grow your career streak.",
    });
  }
}
