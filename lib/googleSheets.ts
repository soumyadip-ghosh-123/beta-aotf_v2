import { google, type sheets_v4 } from "googleapis";

let sheetsClientPromise: Promise<sheets_v4.Sheets> | null = null;

/**
 * Returns an authenticated Google Sheets client using a service account.
 *
 * Env vars:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (supports literal \n escape sequences)
 */
export async function getGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
  if (!sheetsClientPromise) {
    sheetsClientPromise = (async () => {
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

      if (!clientEmail) {
        throw new Error("Missing env var: GOOGLE_SERVICE_ACCOUNT_EMAIL");
      }
      if (!privateKeyRaw) {
        throw new Error("Missing env var: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
      }

      // Many platforms store newlines as literal "\n" sequences.
      const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

      const auth = new google.auth.GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      return google.sheets({ version: "v4", auth });
    })();
  }

  return sheetsClientPromise;
}

/**
 * In-process cache of sheet tabs that have been confirmed to exist.
 * Prevents redundant API calls and race conditions when multiple concurrent
 * sync operations run against the same tab.
 * Key: `${spreadsheetId}::${tabTitle}`
 */
const confirmedTabs = new Set<string>();

/**
 * Ensures a sheet tab with the given title exists in the spreadsheet.
 * If it doesn't exist, it is created and the optional `headers` array is
 * written to row 1 immediately so column names are always present.
 *
 * Uses an in-memory cache so concurrent sync calls don't race to create
 * the same tab simultaneously.
 */
export async function ensureTabExists(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tabTitle: string,
  headers?: string[],
): Promise<void> {
  const cacheKey = `${spreadsheetId}::${tabTitle}`;

  // Fast path: already confirmed in this process session
  if (confirmedTabs.has(cacheKey)) return;

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = (meta.data.sheets ?? []).some(
    (s) => s.properties?.title === tabTitle,
  );

  if (exists) {
    confirmedTabs.add(cacheKey);
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title: tabTitle },
          },
        },
      ],
    },
  });

  console.log(`[googleSheets] Created new tab: "${tabTitle}"`);

  // Write header row immediately after tab creation
  if (headers && headers.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabTitle}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [headers] },
    });
    console.log(`[googleSheets] Wrote ${headers.length} header columns to "${tabTitle}"`);
  }

  confirmedTabs.add(cacheKey);
}


