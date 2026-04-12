import { google, type sheets_v4 } from "googleapis";
import { GoogleAuth } from "google-auth-library";

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

      const auth = new GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const authClient = await auth.getClient();
      return google.sheets({ version: "v4", auth });
    })();
  }

  return sheetsClientPromise;
}

