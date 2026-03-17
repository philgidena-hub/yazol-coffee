import { docClient, TABLE_NAME } from "./dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { SiteSettings } from "./types";

const SETTINGS_PK = "SETTINGS#site";
const SETTINGS_SK = "METADATA";

const DEFAULT_SETTINGS: Omit<SiteSettings, "PK" | "SK" | "entityType" | "updatedAt" | "updatedBy"> = {
  companyName: "Yazol Coffee",
  tagline: "A taste of home, on the move",
  description: "East African-inspired coffee and food, crafted with care in Scarborough, Toronto.",
  address: "2857 Danforth Ave",
  city: "Toronto",
  province: "ON",
  postalCode: "M4C 1M2",
  phone: "(416) 690-5423",
  email: "yazolcoffee@gmail.com",
  instagram: "https://instagram.com/yazolcoffee",
  tiktok: "https://tiktok.com/@yazolcoffee",
  facebook: "",
  shopHours: {
    "0": { open: 9, close: 17, closed: false },
    "1": { open: 8, close: 18, closed: false },
    "2": { open: 8, close: 18, closed: false },
    "3": { open: 8, close: 18, closed: false },
    "4": { open: 8, close: 18, closed: false },
    "5": { open: 8, close: 18, closed: false },
    "6": { open: 9, close: 17, closed: false },
  },
  heroTitle: "Yazol Coffee",
  heroSubtitle: "A taste of home, on the move",
  heroDescription: "East African-inspired coffee and food, crafted with care in Scarborough, Toronto.",
};

/** Get site settings, returning defaults if not yet saved */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: SETTINGS_PK, SK: SETTINGS_SK },
      })
    );
    if (response.Item) {
      return response.Item as SiteSettings;
    }
  } catch (error) {
    console.error("Error fetching site settings:", error);
  }

  // Return defaults
  return {
    PK: SETTINGS_PK,
    SK: SETTINGS_SK,
    entityType: "SiteSettings",
    ...DEFAULT_SETTINGS,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
}

/** Save site settings (super_admin only) */
export async function saveSiteSettings(
  settings: Partial<Omit<SiteSettings, "PK" | "SK" | "entityType">>,
  updatedBy: string
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const now = new Date().toISOString();

  const updated: SiteSettings = {
    ...current,
    ...settings,
    PK: SETTINGS_PK,
    SK: SETTINGS_SK,
    entityType: "SiteSettings",
    updatedAt: now,
    updatedBy,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: updated,
    })
  );

  return updated;
}
