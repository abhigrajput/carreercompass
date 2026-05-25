import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { WhatsAppShareSchema } from "@/lib/validation";

const BASE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://careercompass.vercel.app";

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 20);
  if (limited) return limited;

  const parsed = await parseBody(req, WhatsAppShareSchema);
  if (parsed instanceof Response) return parsed;

  const body = parsed.data;
  const type = body.type;
  let text = "";

  if (type === "game") {
    text = `🎯 I just discovered I'm a *${body.personalityType ?? "Career Explorer"}* on CareerCompass!

My top career match: *${body.careerName ?? "Your career"}* (${body.salary ?? "great salary"})
My score: ${body.score ?? 0}/${body.total ?? 12} questions

🆓 Free career test for Karnataka students:
${BASE}/games

*ನಿಮ್ಮ ದಾರಿ ಕಂಡುಕೊಳ್ಳಿ* 🧭`;
  } else if (type === "roadmap") {
    text = `ನಮಸ್ಕಾರ! 🙏

*${body.studentName ?? "Student"}* ಅವರು CareerCompass ಮೂಲಕ ತಮ್ಮ ವೃತ್ತಿ ಗುರಿ ಕಂಡುಕೊಂಡಿದ್ದಾರೆ:

🎯 ಗುರಿ: *${body.careerName ?? "Career"}*
📅 90-ದಿನದ ಯೋಜನೆ: ${body.link ?? `${BASE}/roadmap`}

🆓 ಉಚಿತ ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶಿ:
${BASE}`;
  } else {
    text = `🏆 ${body.gameName ?? "Skill challenge"} on CareerCompass!

${body.studentName ?? "I"} scored ${body.points ?? 0} points!
Challenge code: ${body.challengeCode ?? "PLAY"}

Play here: ${body.link ?? `${BASE}/skill-games`}`;
  }

  const encoded = encodeURIComponent(text);
  return Response.json({
    url: `https://wa.me/?text=${encoded}`,
    text,
  });
}
