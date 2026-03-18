import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrder } from "@/lib/admin-db";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "online") {
      return NextResponse.json(
        { error: "This order does not require online payment" },
        { status: 400 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This order has already been paid" },
        { status: 400 }
      );
    }

    // Create a Payment Intent instead of a Checkout Session
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(order.total * 100), // cents
      currency: "cad",
      metadata: {
        orderId: order.orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
