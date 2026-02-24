import { NextRequest, NextResponse } from "next/server";
import { createOrder, getMenuItem } from "@/lib/dynamodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, items, pickupTime, specialInstructions, paymentMethod } = body;

    if (!customerName || !customerPhone || !customerEmail || !items?.length || !pickupTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate all items are available
    const unavailableItems: string[] = [];
    for (const item of items) {
      const menuItem = await getMenuItem(item.slug);
      if (!menuItem || !menuItem.isAvailable) {
        unavailableItems.push(item.name || item.slug);
      }
    }
    if (unavailableItems.length > 0) {
      return NextResponse.json(
        { error: `The following items are unavailable: ${unavailableItems.join(", ")}` },
        { status: 409 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.13 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();

    const order = await createOrder({
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      items: items.map((item: { slug: string; name: string; price: number; quantity: number; allergyNotes?: string }) => ({
        slug: item.slug,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        allergyNotes: item.allergyNotes || "",
      })),
      subtotal,
      tax,
      total,
      pickupTime,
      specialInstructions: specialInstructions || "",
      paymentMethod: paymentMethod || "pay_at_pickup",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      total: order.total,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
