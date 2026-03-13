import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updatePaymentStatus } from "@/lib/admin-db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId && session.payment_status === "paid") {
      try {
        await updatePaymentStatus(orderId, "paid");
        console.log(`Payment confirmed for order ${orderId}`);
      } catch (error) {
        console.error(`Failed to update payment status for order ${orderId}:`, error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
