import Razorpay from "razorpay";
import crypto from "crypto";
import { guardRateLimit, parseBody } from "@/lib/api-guard";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "@/lib/security/timing-safe";
import { PaymentCreateSchema, PaymentVerifySchema } from "@/lib/validation";

const PLANS = {
  pro: { amount: 9900, name: "Student Pro Monthly", days: 30 },
  pro_yearly: { amount: 99900, name: "Student Pro Yearly", days: 365 },
  school_starter: { amount: 1500000, name: "School Starter Yearly", days: 365 },
  school_pro: { amount: 4000000, name: "School Pro Yearly", days: 365 },
} as const;

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: Request) {
  const limited = guardRateLimit(req, 10);
  if (limited) return limited;

  const parsed = await parseBody(req, PaymentCreateSchema);
  if (parsed instanceof Response) return parsed;

  try {
    const { plan, studentId = "guest" } = parsed.data;
    const planDetails = PLANS[plan];

    const razorpay = getRazorpay();
    if (!razorpay) {
      return Response.json({ error: "Payment not configured" }, { status: 503 });
    }

    const order = await razorpay.orders.create({
      amount: planDetails.amount,
      currency: "INR",
      receipt: `cc_${studentId}_${Date.now()}`,
      notes: { plan, studentId },
    });

    return Response.json({
      orderId: order.id,
      amount: planDetails.amount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      name: "CareerCompass Karnataka",
      description: planDetails.name,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Payment creation failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const limited = guardRateLimit(req, 10);
  if (limited) return limited;

  const parsed = await parseBody(req, PaymentVerifySchema);
  if (parsed instanceof Response) return parsed;

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      studentId,
    } = parsed.data;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return Response.json({ error: "Payment not configured" }, { status: 503 });
    }

    const planDetails = PLANS[plan];
    if (!planDetails) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (!timingSafeEqual(expected, razorpay_signature)) {
      console.log("SECURITY FIX: Razorpay signature verification failed");
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + planDetails.days);

    const admin = createServiceRoleClient();
    if (admin && studentId && studentId !== "guest") {
      await admin.from("subscriptions").insert({
        student_id: studentId,
        plan,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: planDetails.amount,
        status: "paid",
        expires_at: expires.toISOString(),
      });
      await admin.from("students").update({ is_pro: true }).eq("id", studentId);
    }

    return Response.json({
      success: true,
      message: "Payment verified",
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
