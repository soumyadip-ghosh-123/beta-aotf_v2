import path from "path";
import { config } from "dotenv";
import dns from "node:dns/promises";

// DNS override for dev (mirrors lib/db.ts behaviour)
dns.setServers(["1.1.1.1"]);

config({ path: path.resolve(process.cwd(), ".env.local") });

import { getGoogleSheetsClient } from "../lib/googleSheets.js";

async function run() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("No spreadsheet ID");

  const sheets = await getGoogleSheetsClient();

  const { ENQUIRIES_TAB, ENQUIRIES_HEADERS } = await import("../lib/services/enquiryLedger.service.js");
  const { TUITIONS_TAB, TUITIONS_HEADERS } = await import("../lib/services/postLedger.service.js");

  // Write Enquiries headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${ENQUIRIES_TAB}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [ENQUIRIES_HEADERS] },
  });
  console.log("Enquiries headers written.");

  // Write Tuitions headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TUITIONS_TAB}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [TUITIONS_HEADERS] },
  });
  console.log("Tuitions headers written.");
}

run().catch(console.error);
