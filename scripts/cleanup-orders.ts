/**
 * Cleanup script: Delete all orders and their audit logs from DynamoDB.
 * Run with: node --env-file=.env.local --import tsx scripts/cleanup-orders.ts
 * Requires AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env.local
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "YazolData";

async function cleanupOrders() {
  console.log("Scanning for all ORDER# items...");

  let items: { PK: string; SK: string }[] = [];
  let lastKey: Record<string, unknown> | undefined;

  // Scan for all items with PK starting with "ORDER#"
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :prefix)",
        ExpressionAttributeValues: { ":prefix": "ORDER#" },
        ProjectionExpression: "PK, SK",
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...((result.Items as { PK: string; SK: string }[]) || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  console.log(`Found ${items.length} items to delete (orders + audit logs).`);

  if (items.length === 0) {
    console.log("Nothing to clean up.");
    return;
  }

  // BatchWrite deletes in chunks of 25
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: batch.map((item) => ({
            DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
          })),
        },
      })
    );
    console.log(`Deleted batch ${Math.floor(i / 25) + 1} (${batch.length} items)`);
  }

  console.log("All orders and audit logs deleted.");
}

cleanupOrders().catch(console.error);
