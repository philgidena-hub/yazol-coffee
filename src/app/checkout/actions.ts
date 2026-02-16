"use server";

import { createOrder } from "@/lib/dynamodb";

interface PlaceOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupTime: string;
  specialInstructions: string;
  items: Array<{
    slug: string;
    name: string;
    price: number;
    quantity: number;
    allergyNotes: string;
  }>;
}

interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  total?: number;
  error?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    const { customerName, customerPhone, customerEmail, items, pickupTime, specialInstructions } = input;

    if (!customerName || !customerPhone || !customerEmail || !items?.length || !pickupTime) {
      return { success: false, error: "Missing required fields" };
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
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
      items: items.map((item) => ({
        slug: item.slug,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        allergyNotes: item.allergyNotes,
      })),
      subtotal,
      tax,
      total,
      pickupTime,
      specialInstructions: specialInstructions || "",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, orderId: order.orderId, total: order.total };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}
