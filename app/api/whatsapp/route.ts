const BASE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://careercompass.vercel.app";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    type?: "game" | "roadmap" | "challenge";
    personalityType?: string;
    careerName?: string;
    salary?: string;
    score?: number;
    total?: number;
    studentName?: string;
    examName?: string;
    collegeName?: string;
    link?: string;
    challengeCode?: string;
    points?: number;
    gameName?: string;
  };

  const type = body.type ?? "game";
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
📚 ತಯಾರಿ ಪರೀಕ್ಷೆ: *${body.examName ?? "CET/NEET"}*
🏛️ ಆದರ್ಶ ಕಾಲೇಜು: *${body.collegeName ?? "Karnataka college"}*

90-ದಿನದ ರೋಡ್‌ಮ್ಯಾಪ್ ನೋಡಲು:
${body.link ?? `${BASE}/roadmap`}`;
  } else {
    text = `🎮 Challenge accepted?

I scored *${body.points ?? 0} points* in the ${body.gameName ?? "Career"} skill game on CareerCompass!

Can you beat me?
👉 ${body.link ?? `${BASE}/skill-games?challenge=${body.challengeCode ?? "play"}`}

#CareerCompass #Karnataka #CareerGoals`;
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  return Response.json({ text, waUrl });
}
