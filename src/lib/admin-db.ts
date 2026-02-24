import { docClient, TABLE_NAME, getMenuItem, getAllMenuItems, getAllInventoryItems } from "./dynamodb";
import type { MenuItem, InventoryItem } from "./dynamodb";
import { QueryCommand, GetCommand, UpdateCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { Order, User, UserRole } from "./types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Query all orders that are not completed or cancelled */
export async function getActiveOrders(): Promise<Order[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    FilterExpression: "#status <> :completed AND #status <> :cancelled",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":pk": "ORDERS",
      ":completed": "completed",
      ":cancelled": "cancelled",
    },
    ScanIndexForward: false, // newest first
  });

  const response = await docClient.send(command);
  return (response.Items as Order[]) || [];
}

/** Get a single order by ID */
export async function getOrder(orderId: string): Promise<Order | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `ORDER#${orderId}`,
      SK: "METADATA",
    },
  });

  const response = await docClient.send(command);
  return (response.Item as Order) || null;
}

/** Update an order's status and return the updated order */
export async function updateOrderStatus(
  orderId: string,
  newStatus: Order["status"]
): Promise<Order> {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `ORDER#${orderId}`,
      SK: "METADATA",
    },
    UpdateExpression: "SET #status = :status, updatedAt = :now",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": newStatus,
      ":now": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(command);
  return response.Attributes as Order;
}

/**
 * Atomically deduct inventory for all ingredients in an order.
 * Called when an order transitions to "approved".
 *
 * For each order item:
 *   1. Look up the menu item to get its ingredients
 *   2. Multiply each ingredient quantity by the order item quantity
 *   3. Use DynamoDB ADD with a negative value for atomic decrement
 */
export async function deductInventoryForOrder(order: Order): Promise<void> {
  // Aggregate deductions: inventorySlug -> total amount to subtract
  const deductions = new Map<string, number>();

  for (const orderItem of order.items) {
    const menuItem = await getMenuItem(orderItem.slug);
    if (!menuItem) continue;

    for (const ingredient of menuItem.ingredients) {
      const invSlug = slugify(ingredient.name);
      const amount = parseFloat(ingredient.quantity) * orderItem.quantity;
      deductions.set(invSlug, (deductions.get(invSlug) || 0) + amount);
    }
  }

  // Execute all atomic decrements in parallel
  // Only update items that exist in inventory (ConditionExpression prevents creating phantom records)
  const updates = Array.from(deductions.entries()).map(([invSlug, amount]) =>
    docClient
      .send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `INV#${invSlug}`, SK: "METADATA" },
          UpdateExpression: "ADD currentStock :amount SET updatedAt = :now",
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeValues: {
            ":amount": -amount,
            ":now": new Date().toISOString(),
          },
        })
      )
      .catch((err) => {
        // Silently skip ingredients without inventory records
        if (err.name === "ConditionalCheckFailedException") return;
        throw err;
      })
  );

  await Promise.all(updates);
}

/** Get a single inventory item by slug */
export async function getInventoryItem(slug: string): Promise<InventoryItem | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `INV#${slug}`, SK: "METADATA" },
  });
  const response = await docClient.send(command);
  return (response.Item as InventoryItem) || null;
}

/** Validate that all ingredients for an order have sufficient stock */
export interface StockValidationResult {
  valid: boolean;
  insufficientItems: Array<{
    ingredientName: string;
    required: number;
    available: number;
    unit: string;
  }>;
}

export async function validateStockForOrder(order: Order): Promise<StockValidationResult> {
  const requirements = new Map<string, { name: string; amount: number; unit: string }>();

  for (const orderItem of order.items) {
    const menuItem = await getMenuItem(orderItem.slug);
    if (!menuItem) continue;
    for (const ingredient of menuItem.ingredients) {
      const invSlug = slugify(ingredient.name);
      const amount = parseFloat(ingredient.quantity) * orderItem.quantity;
      const existing = requirements.get(invSlug) || { name: ingredient.name, amount: 0, unit: ingredient.unit };
      existing.amount += amount;
      requirements.set(invSlug, existing);
    }
  }

  const insufficient: StockValidationResult["insufficientItems"] = [];

  await Promise.all(
    Array.from(requirements.entries()).map(async ([invSlug, req]) => {
      const invItem = await getInventoryItem(invSlug);
      const available = invItem?.currentStock ?? 0;
      if (available < req.amount) {
        insufficient.push({
          ingredientName: req.name,
          required: req.amount,
          available,
          unit: req.unit,
        });
      }
    })
  );

  return { valid: insufficient.length === 0, insufficientItems: insufficient };
}

/** After inventory deduction, auto-disable menu items whose ingredients hit zero */
export async function checkAndDisableOutOfStockItems(): Promise<void> {
  const allInventory = await getAllInventoryItems();
  const zeroStockSlugs = new Set(
    allInventory.filter((i) => i.currentStock <= 0).map((i) => i.slug)
  );

  if (zeroStockSlugs.size === 0) return;

  const allItems = await getAllMenuItems();

  for (const menuItem of allItems) {
    if (!menuItem.isAvailable) continue;

    const usesOutOfStock = menuItem.ingredients.some((ing) => {
      const invSlug = slugify(ing.name);
      return zeroStockSlugs.has(invSlug);
    });

    if (usesOutOfStock) {
      await toggleMenuItemAvailability(menuItem.slug, false);
    }
  }
}

/** Get today's completed orders for analytics */
export async function getCompletedOrdersToday(): Promise<Order[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    FilterExpression: "#status = :completed AND createdAt >= :today",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":pk": "ORDERS",
      ":completed": "completed",
      ":today": todayISO,
    },
  });

  const response = await docClient.send(command);
  return (response.Items as Order[]) || [];
}

/** Get daily dashboard stats from completed orders today */
export async function getDailyStats() {
  const orders = await getCompletedOrdersToday();

  const orderCount = orders.length;
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  // Count item occurrences for top items
  const itemCounts = new Map<string, { name: string; count: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = itemCounts.get(item.slug) || { name: item.name, count: 0 };
      existing.count += item.quantity;
      itemCounts.set(item.slug, existing);
    }
  }

  const topItems = Array.from(itemCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    orderCount,
    revenue: Math.round(revenue * 100) / 100,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    topItems,
  };
}

/** Restock an inventory item by adding to its current stock */
export async function restockInventoryItem(
  slug: string,
  amount: number
): Promise<void> {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `INV#${slug}`,
      SK: "METADATA",
    },
    UpdateExpression: "ADD currentStock :amount SET updatedAt = :now, lastRestockedAt = :now",
    ConditionExpression: "attribute_exists(PK)",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":now": new Date().toISOString(),
    },
  });

  await docClient.send(command);
}

/** Toggle a menu item's isAvailable flag */
export async function toggleMenuItemAvailability(
  slug: string,
  isAvailable: boolean
): Promise<void> {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `MENU#${slug}`,
      SK: "METADATA",
    },
    UpdateExpression: "SET isAvailable = :available, updatedAt = :now",
    ExpressionAttributeValues: {
      ":available": isAvailable,
      ":now": new Date().toISOString(),
    },
  });

  await docClient.send(command);
}

// ============================================================
// MENU ITEM CRUD
// ============================================================

export { slugify };

/** Create a new menu item */
export async function createMenuItem(data: {
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  price: number;
  isAvailable: boolean;
  imageKey: string;
  ingredients: MenuItem["ingredients"];
}): Promise<MenuItem> {
  const slug = slugify(data.name);
  const now = new Date().toISOString();

  const item = {
    PK: `MENU#${slug}`,
    SK: "METADATA",
    entityType: "MenuItem",
    name: data.name,
    slug,
    description: data.description,
    category: data.category,
    price: data.price,
    isAvailable: data.isAvailable,
    imageKey: data.imageKey || `menu/${slug}.jpg`,
    ingredients: data.ingredients,
    createdAt: now,
    updatedAt: now,
    GSI1PK: `CATEGORY#${data.categorySlug}`,
    GSI1SK: `MENU#${data.name}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(PK)",
    })
  );

  return item as MenuItem;
}

/** Update an existing menu item */
export async function updateMenuItem(
  slug: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    categorySlug?: string;
    price?: number;
    isAvailable?: boolean;
    imageKey?: string;
    ingredients?: MenuItem["ingredients"];
  }
): Promise<void> {
  const expressions: string[] = ["updatedAt = :now"];
  const values: Record<string, unknown> = { ":now": new Date().toISOString() };
  const names: Record<string, string> = {};

  if (data.name !== undefined) {
    expressions.push("#n = :name");
    names["#n"] = "name";
    values[":name"] = data.name;
  }
  if (data.description !== undefined) {
    expressions.push("description = :desc");
    values[":desc"] = data.description;
  }
  if (data.category !== undefined) {
    expressions.push("category = :cat");
    values[":cat"] = data.category;
  }
  if (data.categorySlug !== undefined) {
    expressions.push("GSI1PK = :gsi1pk");
    values[":gsi1pk"] = `CATEGORY#${data.categorySlug}`;
  }
  if (data.price !== undefined) {
    expressions.push("price = :price");
    values[":price"] = data.price;
  }
  if (data.isAvailable !== undefined) {
    expressions.push("isAvailable = :avail");
    values[":avail"] = data.isAvailable;
  }
  if (data.imageKey !== undefined) {
    expressions.push("imageKey = :img");
    values[":img"] = data.imageKey;
  }
  if (data.ingredients !== undefined) {
    expressions.push("ingredients = :ingredients");
    values[":ingredients"] = data.ingredients;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `MENU#${slug}`, SK: "METADATA" },
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ...(Object.keys(names).length > 0 && { ExpressionAttributeNames: names }),
      ExpressionAttributeValues: values,
      ConditionExpression: "attribute_exists(PK)",
    })
  );
}

/** Delete a menu item */
export async function deleteMenuItem(slug: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `MENU#${slug}`, SK: "METADATA" },
      ConditionExpression: "attribute_exists(PK)",
    })
  );
}

// ============================================================
// INVENTORY ITEM CRUD
// ============================================================

/** Create a new inventory item */
export async function createInventoryItem(data: {
  name: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
}): Promise<InventoryItem> {
  const slug = slugify(data.name);
  const now = new Date().toISOString();

  const item = {
    PK: `INV#${slug}`,
    SK: "METADATA",
    entityType: "InventoryItem",
    name: data.name,
    slug,
    unit: data.unit,
    currentStock: data.currentStock,
    lowStockThreshold: data.lowStockThreshold,
    lastRestockedAt: now,
    createdAt: now,
    updatedAt: now,
    GSI1PK: "INVENTORY",
    GSI1SK: `ITEM#${data.name}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(PK)",
    })
  );

  return item as InventoryItem;
}

/** Update an existing inventory item */
export async function updateInventoryItem(
  slug: string,
  data: {
    name?: string;
    unit?: string;
    lowStockThreshold?: number;
  }
): Promise<void> {
  const expressions: string[] = ["updatedAt = :now"];
  const values: Record<string, unknown> = { ":now": new Date().toISOString() };
  const names: Record<string, string> = {};

  if (data.name !== undefined) {
    expressions.push("#n = :name");
    names["#n"] = "name";
    values[":name"] = data.name;
  }
  if (data.unit !== undefined) {
    expressions.push("unit = :unit");
    values[":unit"] = data.unit;
  }
  if (data.lowStockThreshold !== undefined) {
    expressions.push("lowStockThreshold = :threshold");
    values[":threshold"] = data.lowStockThreshold;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `INV#${slug}`, SK: "METADATA" },
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ...(Object.keys(names).length > 0 && { ExpressionAttributeNames: names }),
      ExpressionAttributeValues: values,
      ConditionExpression: "attribute_exists(PK)",
    })
  );
}

/** Set inventory stock to an absolute value (admin override) */
export async function setInventoryStock(slug: string, newStock: number): Promise<void> {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `INV#${slug}`, SK: "METADATA" },
    UpdateExpression: "SET currentStock = :stock, updatedAt = :now",
    ConditionExpression: "attribute_exists(PK)",
    ExpressionAttributeValues: {
      ":stock": newStock,
      ":now": new Date().toISOString(),
    },
  });

  await docClient.send(command);
}

/** Delete an inventory item */
export async function deleteInventoryItem(slug: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `INV#${slug}`, SK: "METADATA" },
      ConditionExpression: "attribute_exists(PK)",
    })
  );
}

// ============================================================
// ORDER HISTORY
// ============================================================

// ============================================================
// USER MANAGEMENT
// ============================================================

/** Get a user by username */
export async function getUserByUsername(username: string): Promise<User | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${username}`,
      SK: "METADATA",
    },
  });

  const response = await docClient.send(command);
  return (response.Item as User) || null;
}

/** Create a new user */
export async function createUser(data: {
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string;
}): Promise<User> {
  const now = new Date().toISOString();

  const item = {
    PK: `USER#${data.username}`,
    SK: "METADATA",
    entityType: "User",
    username: data.username,
    passwordHash: data.passwordHash,
    role: data.role,
    name: data.name,
    active: true,
    createdAt: now,
    updatedAt: now,
    GSI1PK: "USERS",
    GSI1SK: `ROLE#${data.role}#${data.username}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(PK)",
    })
  );

  return item as User;
}

/** Get all users (for user management UI) */
export async function getAllUsers(): Promise<User[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: {
      ":pk": "USERS",
    },
  });

  const response = await docClient.send(command);
  return (response.Items as User[]) || [];
}

/** Update a user (role, name, active status, password) */
export async function updateUser(
  username: string,
  data: {
    role?: UserRole;
    name?: string;
    active?: boolean;
    passwordHash?: string;
  }
): Promise<void> {
  const expressions: string[] = ["updatedAt = :now"];
  const values: Record<string, unknown> = { ":now": new Date().toISOString() };
  const names: Record<string, string> = {};

  if (data.role !== undefined) {
    expressions.push("#r = :role");
    names["#r"] = "role";
    values[":role"] = data.role;
    expressions.push("GSI1SK = :gsi1sk");
    values[":gsi1sk"] = `ROLE#${data.role}#${username}`;
  }
  if (data.name !== undefined) {
    expressions.push("#n = :name");
    names["#n"] = "name";
    values[":name"] = data.name;
  }
  if (data.active !== undefined) {
    expressions.push("active = :active");
    values[":active"] = data.active;
  }
  if (data.passwordHash !== undefined) {
    expressions.push("passwordHash = :hash");
    values[":hash"] = data.passwordHash;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${username}`, SK: "METADATA" },
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ...(Object.keys(names).length > 0 && { ExpressionAttributeNames: names }),
      ExpressionAttributeValues: values,
      ConditionExpression: "attribute_exists(PK)",
    })
  );
}

/** Delete a user */
export async function deleteUser(username: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${username}`, SK: "METADATA" },
      ConditionExpression: "attribute_exists(PK)",
    })
  );
}

// ============================================================
// ORDER HISTORY
// ============================================================

// ============================================================
// AUDIT LOGGING
// ============================================================

export interface AuditLogEntry {
  PK: string;
  SK: string;
  entityType: string;
  orderId: string;
  timestamp: string;
  username: string;
  userRole: UserRole;
  fromStatus: Order["status"];
  toStatus: Order["status"];
  note: string;
}

/** Create an audit log entry for a status change */
export async function createAuditLog(entry: {
  orderId: string;
  username: string;
  userRole: UserRole;
  fromStatus: Order["status"];
  toStatus: Order["status"];
  note?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ORDER#${entry.orderId}`,
        SK: `LOG#${now}`,
        entityType: "AuditLog",
        orderId: entry.orderId,
        timestamp: now,
        username: entry.username,
        userRole: entry.userRole,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        note: entry.note || "",
      },
    })
  );
}

/** Get all audit log entries for an order (chronological) */
export async function getAuditLogs(orderId: string): Promise<AuditLogEntry[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":pk": `ORDER#${orderId}`,
      ":prefix": "LOG#",
    },
    ScanIndexForward: true,
  });

  const response = await docClient.send(command);
  return (response.Items as AuditLogEntry[]) || [];
}

/** Get finished orders — completed and cancelled (newest first, limited) */
export async function getFinishedOrders(limit: number = 50): Promise<Order[]> {
  const results: Order[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      FilterExpression: "#status = :completed OR #status = :cancelled",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":pk": "ORDERS",
        ":completed": "completed",
        ":cancelled": "cancelled",
      },
      ScanIndexForward: false,
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    });

    const response = await docClient.send(command);
    if (response.Items) {
      results.push(...(response.Items as Order[]));
    }
    lastKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey && results.length < limit);

  return results.slice(0, limit);
}
