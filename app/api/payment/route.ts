import Razorpay from "razorpay";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const PLANS = {
  pro: { amount: 9900, name: "Student Pro Monthly", days: 30 },
  pro_yearly: { amount: 99900, name: "Student Pro Yearly", days: 365 },
  school_starter: { amount: 1500000, name: "School Starter Yearly", days: 365 },
  school_pro: { amount: 4000000, name: "School Pro Yearly", days: 365 },
} as const;

type PlanKey = keyof typeof PLANS;

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      plan?: string;
      studentId?: string;
    };
    const plan = body.plan as PlanKey | undefined;
    const studentId = body.studentId ?? "guest";

    const planDetails = plan ? PLANS[plan] : undefined;
    if (!planDetails) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return Response.json({ error: "Payment not configured" }, { status: 503 });
    }

    const order = await razorpay.orders.create({
      amount: planDetails.amount,
      currency: "INR",
      receipt: `cc_${studentId}_${Date.now()}`,
      notes: { plan: plan ?? "", studentId },
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
  try {
    const body = (await req.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      plan?: string;
      studentId?: string;
    };

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      studentId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return Response.json({ error: "Payment not configured" }, { status: 503 });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const planKey = (plan ?? "pro") as PlanKey;
    const planDetails = PLANS[planKey] ?? PLANS.pro;
    const expires = new Date();
    expires.setDate(expires.getDate() + planDetails.days);

    const admin = createServiceRoleClient();
    if (admin && studentId && studentId !== "guest") {
      await admin.from("subscriptions").insert({
        student_id: studentId,
        plan: planKey,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: planDetails.amount,
        status: "paid",
        expires_at: expires.toISOString(),
      });
      await admin
        .from("students")
        .update({ is_pro: true })
        .eq("id", studentId);
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
