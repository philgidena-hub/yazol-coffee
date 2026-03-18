import { docClient, TABLE_NAME } from "./dynamodb";
import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Customer } from "./types";

/** Normalize phone to digits only (e.g. "(416) 555-1234" → "4165551234") */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Get a customer by phone number (primary key) */
export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const normalized = normalizePhone(phone);
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `CUSTOMER#${normalized}`,
      SK: "METADATA",
    },
  });

  const response = await docClient.send(command);
  return (response.Item as Customer) || null;
}

/** Get a customer by email (legacy lookup via GSI) */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":pk": "CUSTOMERS",
      ":email": email.toLowerCase(),
    },
    Limit: 1,
  });

  const response = await docClient.send(command);
  return (response.Items?.[0] as Customer) || null;
}

/**
 * Get or create a customer by phone number.
 * Called automatically when a customer places an order.
 * - If the phone exists, updates name/email and increments order count.
 * - If new, creates a CUSTOMER record with a generated customerId.
 */
export async function getOrCreateCustomerByPhone(data: {
  phone: string;
  name: string;
  email: string;
}): Promise<Customer> {
  const normalized = normalizePhone(data.phone);
  if (!normalized || normalized.length < 7) {
    throw new Error("Invalid phone number");
  }
  const existing = await getCustomerByPhone(normalized);

  if (existing) {
    // Update name/email if provided, increment order count
    const now = new Date().toISOString();
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `CUSTOMER#${normalized}`,
          SK: "METADATA",
        },
        UpdateExpression:
          "SET #n = :name, email = :email, orderCount = orderCount + :inc, updatedAt = :now",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: {
          ":name": data.name,
          ":email": data.email.toLowerCase(),
          ":inc": 1,
          ":now": now,
        },
      })
    );

    return {
      ...existing,
      name: data.name,
      email: data.email.toLowerCase(),
      orderCount: (existing.orderCount || 0) + 1,
      updatedAt: now,
    };
  }

  // New customer — create record
  const now = new Date().toISOString();
  const customerId = crypto.randomUUID();

  const item = {
    PK: `CUSTOMER#${normalized}`,
    SK: "METADATA",
    entityType: "Customer",
    customerId,
    email: data.email.toLowerCase(),
    name: data.name,
    phoneNumber: normalized,
    role: "customer" as const,
    provider: "guest" as const,
    onboardingComplete: true,
    orderCount: 1,
    createdAt: now,
    updatedAt: now,
    GSI1PK: "CUSTOMERS",
    GSI1SK: `CREATED#${now}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item as Customer;
}

/** Update customer profile */
export async function updateCustomerProfile(
  phone: string,
  data: {
    name: string;
    email?: string;
    favoriteCoffee?: string;
  }
): Promise<void> {
  const normalized = normalizePhone(phone);
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `CUSTOMER#${normalized}`,
      SK: "METADATA",
    },
    UpdateExpression:
      "SET #n = :name, favoriteCoffee = :coffee, updatedAt = :now" +
      (data.email ? ", email = :email" : ""),
    ExpressionAttributeNames: { "#n": "name" },
    ExpressionAttributeValues: {
      ":name": data.name,
      ":coffee": data.favoriteCoffee || "",
      ":now": new Date().toISOString(),
      ...(data.email ? { ":email": data.email.toLowerCase() } : {}),
    },
    ConditionExpression: "attribute_exists(PK)",
  });

  await docClient.send(command);
}
