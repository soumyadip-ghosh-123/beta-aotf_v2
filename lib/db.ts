import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local",
  );
}

// Prevent NoSQL query injection (strips $gt, $ne etc. from filter objects)
mongoose.set("sanitizeFilter", true);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Use a global cache to prevent multiple Mongoose connections during
 * Next.js dev hot-reloads (serverless functions get a fresh module scope on
 * each cold start in production, so this only matters in dev).
 */
const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

/** Maximum number of connection attempts before giving up */
const MAX_RETRIES = 3;

/** Base delay between retries (doubles each attempt: 2s → 4s → 8s) */
const RETRY_BASE_MS = 2_000;

const CONNECT_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  // Give Atlas M0 time to wake from pause (~5-10s)
  serverSelectionTimeoutMS: 15_000,
  // Timeout for initial socket connection
  connectTimeoutMS: 15_000,
  // Timeout for individual socket operations
  socketTimeoutMS: 30_000,
  // Heartbeat frequency to detect dropped connections
  heartbeatFrequencyMS: 10_000,
};

/**
 * Attempt a single connection and return the Mongoose instance.
 * Clears the cached promise on failure so the next call retries.
 */
function attemptConnect(): Promise<typeof mongoose> {
  cached.promise = mongoose
    .connect(MONGODB_URI, CONNECT_OPTIONS)
    .then((m) => m)
    .catch((err) => {
      // Clear the cached promise so the next invocation retries
      cached.promise = null;
      cached.conn = null;
      throw err;
    });
  return cached.promise;
}

/**
 * Open (or re-use) a Mongoose connection.
 * Safe for serverless — caches the connection promise so concurrent
 * invocations share the same underlying socket.
 *
 * Handles Atlas free-tier cold starts:
 * - Sets explicit timeouts so requests don't hang indefinitely
 * - Retries up to MAX_RETRIES times with exponential back-off
 *   (2 s → 4 s) so a slowly-waking M0 cluster has time to respond
 * - Clears the cached promise on failure so subsequent requests retry
 * - The companion instrumentation.ts warms the connection at startup
 *   so the first user-facing request almost always gets a hot conn
 */
export default async function dbConnect(): Promise<typeof mongoose> {
  // Re-use an existing healthy connection
  if (cached.conn) {
    // Verify the connection is still alive (readyState 1 = connected)
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
    // Connection dropped — clear cache and reconnect
    cached.conn = null;
    cached.promise = null;
  }

  // If another caller already started a connection attempt, piggy-back on it
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Otherwise try connecting with retries + exponential back-off
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      cached.conn = await attemptConnect();
      return cached.conn;
    } catch (err) {
      lastError = err;

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_MS * 2 ** (attempt - 1); // 2s, 4s
        console.warn(
          `[db] Connection attempt ${attempt}/${MAX_RETRIES} failed. ` +
            `Retrying in ${delay / 1000}s…`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  // All retries exhausted
  throw lastError;
}
