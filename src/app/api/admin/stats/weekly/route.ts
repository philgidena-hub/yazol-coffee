import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/dynamodb";
import { requirePermission } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "view_dashboard_stats");
  if (auth instanceof NextResponse) return auth;

  try {
    // Calculate date range: 7 days ago at midnight to now
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const startISO = sevenDaysAgo.toISOString();

    // Query all orders from GSI1 where GSI1PK = "ORDERS" and GSI1SK >= 7 days ago
    let allOrders: Order[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk AND GSI1SK >= :startDate",
        ExpressionAttributeValues: {
          ":pk": "ORDERS",
          ":startDate": startISO,
        },
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
      });

      const response = await docClient.send(command);
      if (response.Items) {
        allOrders = allOrders.concat(response.Items as Order[]);
      }
      lastEvaluatedKey = response.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;
    } while (lastEvaluatedKey);

    // Separate cancelled orders
    const cancelledOrders = allOrders.filter((o) => o.status === "cancelled");
    const activeOrders = allOrders.filter((o) => o.status !== "cancelled");
    const completedOrders = activeOrders.filter(
      (o) => o.status === "completed"
    );

    // Summary
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue =
      activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

    const summary = {
      totalOrders: activeOrders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
    };

    // Daily breakdown - build a map for 7 days
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyMap = new Map<
      string,
      { date: string; dayLabel: string; orders: number; revenue: number }
    >();

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0]; // "2026-03-17"
      dailyMap.set(dateStr, {
        date: dateStr,
        dayLabel: dayLabels[d.getDay()],
        orders: 0,
        revenue: 0,
      });
    }

    for (const order of activeOrders) {
      const dateStr = order.createdAt.split("T")[0];
      const entry = dailyMap.get(dateStr);
      if (entry) {
        entry.orders += 1;
        entry.revenue += order.total;
      }
    }

    const dailyBreakdown = Array.from(dailyMap.values()).map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * 100) / 100,
    }));

    // Top items - aggregate across all active orders
    const itemMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    for (const order of activeOrders) {
      for (const item of order.items) {
        const existing = itemMap.get(item.name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          itemMap.set(item.name, {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      }
    }

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        revenue: Math.round(item.revenue * 100) / 100,
      }));

    // Sales by staff - group by customerEmail
    const staffMap = new Map<
      string,
      { name: string; orders: number; revenue: number }
    >();

    for (const order of activeOrders) {
      const isPOS =
        order.customerEmail &&
        order.customerEmail.includes("@admin.yazolcoffee.com");
      const key = isPOS ? order.customerEmail : "online";
      const displayName = isPOS
        ? order.customerName || "POS Order"
        : "Online Orders";

      const existing = staffMap.get(key);
      if (existing) {
        existing.orders += 1;
        existing.revenue += order.total;
      } else {
        staffMap.set(key, {
          name: displayName,
          orders: 1,
          revenue: order.total,
        });
      }
    }

    const salesByStaff = Array.from(staffMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((s) => ({
        ...s,
        revenue: Math.round(s.revenue * 100) / 100,
      }));

    // Period
    const endDate = new Date(now);
    const period = {
      start: sevenDaysAgo.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };

    return NextResponse.json({
      period,
      summary,
      dailyBreakdown,
      topItems,
      salesByStaff,
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly stats" },
      { status: 500 }
    );
  }
}
