"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dbConnect;
var mongoose_1 = require("mongoose");
var MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}
// Prevent NoSQL query injection (strips $gt, $ne etc. from filter objects)
mongoose_1.default.set("sanitizeFilter", true);
/**
 * Use a global cache to prevent multiple Mongoose connections during
 * Next.js dev hot-reloads (serverless functions get a fresh module scope on
 * each cold start in production, so this only matters in dev).
 */
var globalWithMongoose = globalThis;
var cached = (_a = globalWithMongoose.mongoose) !== null && _a !== void 0 ? _a : {
    conn: null,
    promise: null,
};
if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = cached;
}
/** Maximum number of connection attempts before giving up */
var MAX_RETRIES = 3;
/** Base delay between retries (doubles each attempt: 2s → 4s → 8s) */
var RETRY_BASE_MS = 2000;
var CONNECT_OPTIONS = {
    maxPoolSize: 10,
    // Give Atlas M0 time to wake from pause (~5-10s)
    serverSelectionTimeoutMS: 15000,
    // Timeout for initial socket connection
    connectTimeoutMS: 15000,
    // Timeout for individual socket operations
    socketTimeoutMS: 30000,
    // Heartbeat frequency to detect dropped connections
    heartbeatFrequencyMS: 10000,
};
/**
 * Attempt a single connection and return the Mongoose instance.
 * Clears the cached promise on failure so the next call retries.
 */
function attemptConnect() {
    cached.promise = mongoose_1.default
        .connect(MONGODB_URI, CONNECT_OPTIONS)
        .then(function (m) { return m; })
        .catch(function (err) {
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
function dbConnect() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, lastError, _loop_1, attempt, state_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Re-use an existing healthy connection
                    if (cached.conn) {
                        // Verify the connection is still alive (readyState 1 = connected)
                        if (cached.conn.connection.readyState === 1) {
                            return [2 /*return*/, cached.conn];
                        }
                        // Connection dropped — clear cache and reconnect
                        cached.conn = null;
                        cached.promise = null;
                    }
                    if (!cached.promise) return [3 /*break*/, 2];
                    _a = cached;
                    return [4 /*yield*/, cached.promise];
                case 1:
                    _a.conn = _b.sent();
                    return [2 /*return*/, cached.conn];
                case 2:
                    _loop_1 = function (attempt) {
                        var _c, err_1, delay_1;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 2, , 5]);
                                    _c = cached;
                                    return [4 /*yield*/, attemptConnect()];
                                case 1:
                                    _c.conn = _d.sent();
                                    return [2 /*return*/, { value: cached.conn }];
                                case 2:
                                    err_1 = _d.sent();
                                    lastError = err_1;
                                    if (!(attempt < MAX_RETRIES)) return [3 /*break*/, 4];
                                    delay_1 = RETRY_BASE_MS * Math.pow(2, (attempt - 1));
                                    console.warn("[db] Connection attempt ".concat(attempt, "/").concat(MAX_RETRIES, " failed. ") +
                                        "Retrying in ".concat(delay_1 / 1000, "s\u2026"));
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, delay_1); })];
                                case 3:
                                    _d.sent();
                                    _d.label = 4;
                                case 4: return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 1;
                    _b.label = 3;
                case 3:
                    if (!(attempt <= MAX_RETRIES)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 4:
                    state_1 = _b.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _b.label = 5;
                case 5:
                    attempt++;
                    return [3 /*break*/, 3];
                case 6: 
                // All retries exhausted
                throw lastError;
            }
        });
    });
}
