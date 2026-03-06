/**
 * Test script for the Clerk webhook handler.
 * Uses the svix Webhook class to sign a payload exactly as Clerk would.
 *
 * Usage:
 *   node scripts/test-clerk-webhook.mjs [event]
 *
 * Events: user.created (default) | user.updated | user.deleted
 */

import { Webhook } from "svix";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load env ──────────────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");

let CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
if (!CLERK_WEBHOOK_SECRET) {
  try {
    const envFile = readFileSync(envPath, "utf8");
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("CLERK_WEBHOOK_SECRET=")) {
        CLERK_WEBHOOK_SECRET = trimmed
          .slice("CLERK_WEBHOOK_SECRET=".length)
          .trim();
        break;
      }
    }
  } catch {
    // ignore
  }
}

if (!CLERK_WEBHOOK_SECRET) {
  console.error("❌  CLERK_WEBHOOK_SECRET not found in .env.local");
  process.exit(1);
}

const WEBHOOK_URL = "http://localhost:3000/api/v1/webhooks/clerk";
const eventType = process.argv[2] ?? "user.created";

// ── Payloads per event type ────────────────────────────────────────────────────
const TEST_USER_ID = `user_test_${Date.now()}`;

const payloads = {
  "user.created": {
    id: TEST_USER_ID,
    object: "user",
    username: `testuser_${Date.now()}`,
    first_name: "Test",
    last_name: "User",
    email_addresses: [
      {
        id: "idn_test",
        email_address: "test@example.com",
        verification: { status: "verified" },
      },
    ],
    primary_email_address_id: "idn_test",
    created_at: Date.now(),
    updated_at: Date.now(),
    public_metadata: {},
    private_metadata: {},
    unsafe_metadata: {},
  },
  "user.updated": {
    id: TEST_USER_ID,
    object: "user",
    username: `testuser_updated_${Date.now()}`,
    first_name: "Test",
    last_name: "Updated",
    email_addresses: [
      {
        id: "idn_test",
        email_address: "test@example.com",
        verification: { status: "verified" },
      },
    ],
    primary_email_address_id: "idn_test",
    created_at: Date.now() - 60_000,
    updated_at: Date.now(),
    public_metadata: {},
    private_metadata: {},
    unsafe_metadata: {},
  },
  "user.deleted": {
    id: TEST_USER_ID,
    object: "user",
    deleted: true,
  },
};

const data = payloads[eventType];
if (!data) {
  console.error(`❌  Unknown event type: ${eventType}`);
  console.error(`   Supported: ${Object.keys(payloads).join(", ")}`);
  process.exit(1);
}

// ── Sign the payload ──────────────────────────────────────────────────────────
const wh = new Webhook(CLERK_WEBHOOK_SECRET);
const payload = JSON.stringify({ type: eventType, data, object: "event" });
const msgId = `msg_test_${Date.now()}`;
const timestamp = new Date();
// svix v1.x: sign() returns the raw "v1,<base64sig>" string.
// We must build the three svix headers ourselves.
const timestampSeconds = Math.floor(timestamp.getTime() / 1000).toString();

let signature;
try {
  signature = wh.sign(msgId, timestamp, payload);
} catch (err) {
  console.error("❌  Failed to sign payload:", err.message);
  process.exit(1);
}

const signedHeaders = {
  "svix-id": msgId,
  "svix-timestamp": timestampSeconds,
  "svix-signature": signature,
};

// ── Send the request ──────────────────────────────────────────────────────────
console.log(`\n→ Sending ${eventType} to ${WEBHOOK_URL}`);
console.log(`  User ID : ${data.id}`);
if (data.username) console.log(`  Username: ${data.username}`);
console.log(`  Msg ID  : ${msgId}\n`);

let res, body;
try {
  res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...signedHeaders,
    },
    body: payload,
  });
  body = await res.json().catch(() => res.text());
} catch (err) {
  console.error("❌  Request failed:", err.message);
  process.exit(1);
}

const status = res.status;
const icon = status >= 200 && status < 300 ? "✅" : "❌";
console.log(`${icon}  HTTP ${status}`);
console.log("   Response:", JSON.stringify(body, null, 2));

if (status !== 200) process.exit(1);
