import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, GetCommand, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { Order } from "./types";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const docClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = "YazolData";

// Helper types
export interface MenuItem {
  PK: string;
  SK: string;
  entityType: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageKey: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  PK: string;
  SK: string;
  entityType: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  PK: string;
  SK: string;
  entityType: string;
  name: string;
  slug: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  lastRestockedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Query all categories
export async function getAllCategories(): Promise<Category[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: {
      ":pk": "CATEGORIES",
    },
  });

  const response = await docClient.send(command);
  return (response.Items as Category[]) || [];
}

// Query menu items by category
export async function getMenuItemsByCategory(categorySlug: string): Promise<MenuItem[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: {
      ":pk": `CATEGORY#${categorySlug}`,
    },
  });

  const response = await docClient.send(command);
  return (response.Items as MenuItem[]) || [];
}

// Get all menu items (PK begins with MENU#)
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "begins_with(PK, :prefix)",
    ExpressionAttributeValues: {
      ":prefix": "MENU#",
    },
  });

  const response = await docClient.send(command);
  return (response.Items as MenuItem[]) || [];
}

// Get single menu item
export async function getMenuItem(slug: string): Promise<MenuItem | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `MENU#${slug}`,
      SK: "METADATA",
    },
  });

  const response = await docClient.send(command);
  return (response.Item as MenuItem) || null;
}

// Create an order
export async function createOrder(
  order: Omit<Order, "PK" | "SK" | "entityType">
): Promise<Order> {
  const item: Order = {
    PK: `ORDER#${order.orderId}`,
    SK: "METADATA",
    entityType: "Order",
    ...order,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        GSI1PK: "ORDERS",
        GSI1SK: order.createdAt,
      },
    })
  );

  return item;
}

// Get all inventory items
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: {
      ":pk": "INVENTORY",
    },
  });

  const response = await docClient.send(command);
  return (response.Items as InventoryItem[]) || [];
}
