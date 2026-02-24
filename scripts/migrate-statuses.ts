/**
 * Migration script: Rename order statuses
 *   "confirmed" -> "approved"
 *   "ready"     -> "prepared"
 *
 * Run: npx tsx scripts/migrate-statuses.ts
 *
 * Idempotent — safe to run multiple times.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "YazolData";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const STATUS_MAP: Record<string, string> = {
  confirmed: "approved",
  ready: "prepared",
};

async function migrate() {
  console.log("Scanning for orders with old status names...\n");

  let lastKey: Record<string, unknown> | undefined;
  let scanned = 0;
  let updated = 0;

  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "entityType = :type AND (#status = :confirmed OR #status = :ready)",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":type": "Order",
          ":confirmed": "confirmed",
          ":ready": "ready",
        },
        ExclusiveStartKey: lastKey,
      })
    );

    scanned += result.ScannedCount || 0;

    for (const item of result.Items || []) {
      const oldStatus = item.status as string;
      const newStatus = STATUS_MAP[oldStatus];
      if (!newStatus) continue;

      console.log(`  ORDER#${item.orderId} : ${oldStatus} -> ${newStatus}`);

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: "SET #status = :newStatus, updatedAt = :now",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":newStatus": newStatus,
            ":now": new Date().toISOString(),
          },
        })
      );

      updated++;
    }

    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  console.log(`\nDone. Scanned ${scanned} items, updated ${updated} orders.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
