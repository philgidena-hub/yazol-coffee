import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updatePaymentStatus } from "@/lib/admin-db";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`Stripe webhook received: ${event.type}`);

  // Handle Payment Intent succeeded (inline payment)
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;

    console.log(`Payment intent succeeded — orderId: ${orderId}`);

    if (orderId) {
      try {
        const updated = await updatePaymentStatus(orderId, "paid");
        console.log(`Payment confirmed for order ${orderId}`, JSON.stringify(updated));
      } catch (error) {
        console.error(`Failed to update payment status for order ${orderId}:`, error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }
    }
  }

  // Keep legacy checkout session handler for any existing sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId && session.payment_status === "paid") {
      try {
        await updatePaymentStatus(orderId, "paid");
        console.log(`Payment confirmed (checkout session) for order ${orderId}`);
      } catch (error) {
        console.error(`Failed to update payment status for order ${orderId}:`, error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
