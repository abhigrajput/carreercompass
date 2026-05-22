export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD ?? "careercompass2025";

  if (!password || password !== expected) {
    return Response.json({ ok: false }, { status: 401 });
  }

  return Response.json({
    ok: true,
    token: Buffer.from(`admin:${expected}`).toString("base64"),
  });
}
