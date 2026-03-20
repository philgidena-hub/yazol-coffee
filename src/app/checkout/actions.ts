"use server";

import { createOrder, getMenuItem } from "@/lib/dynamodb";
import { getOrCreateCustomerByPhone } from "@/lib/customer-db";

interface PlaceOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupTime: string;
  specialInstructions: string;
  paymentMethod: "online" | "pay_at_pickup";
  items: Array<{
    slug: string;
    name: string;
    price: number;
    quantity: number;
    allergyNotes: string;
    size?: string;
    options?: string[];
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
    const { customerName, customerPhone, customerEmail, items, pickupTime, specialInstructions, paymentMethod } = input;

    if (!customerName || !customerPhone || !customerEmail || !items?.length || !pickupTime) {
      return { success: false, error: "Missing required fields" };
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
      return { success: false, error: `The following items are unavailable: ${unavailableItems.join(", ")}` };
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
        ...(item.size && { size: item.size }),
        ...(item.options && item.options.length > 0 && { options: item.options }),
      })),
      subtotal,
      tax,
      total,
      pickupTime,
      specialInstructions: specialInstructions || "",
      paymentMethod: "online",
      paymentStatus: "unpaid",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Auto-register customer by phone (fire-and-forget, don't block order)
    getOrCreateCustomerByPhone({
      phone: customerPhone,
      name: customerName,
      email: customerEmail,
    }).catch((err) => console.error("Auto-register customer failed:", err));

    return { success: true, orderId: order.orderId, total: order.total };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}
