import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return Response.json(
        { error: "Payment not configured" },
        { status: 503 },
      );
    }

    const { plan } = (await req.json()) as { plan: string };
    const amount = plan === "pro" ? 9900 : 99900;

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return Response.json(order);
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Payment creation failed" },
      { status: 500 },
    );
  }
}
