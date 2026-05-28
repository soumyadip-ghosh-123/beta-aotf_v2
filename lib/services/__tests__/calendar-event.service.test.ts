/**
 * Unit tests for CalendarEventService mapping helpers.
 *
 * These tests are pure — no database connection is needed.
 * They verify:
 *   - eventKey generation for each source type
 *   - mapApplication: DC/GC date selection, status → label/color, tuition vs job
 *   - mapEnquiry: status → label/color
 *   - mapFeedback: status → label/color
 *   - mapTodo: isDone → color override
 */

// Mock DB connection so MONGODB_URI check doesn't fire during pure unit tests
jest.mock("@/lib/db", () => jest.fn().mockResolvedValue(undefined));
// Mock CalendarEvent model — only the mapping helpers are under test here
jest.mock("@/lib/models/CalendarEvent", () => ({
  __esModule: true,
  default: { findOneAndUpdate: jest.fn(), deleteOne: jest.fn() },
}));

import {
  tuitionApplicationEventKey,
  jobApplicationEventKey,
  enquiryEventKey,
  feedbackEventKey,
  todoEventKey,
  mapApplication,
  mapEnquiry,
  mapFeedback,
  mapTodo,
} from "../calendar-event.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseId = "507f1f77bcf86cd799439011";
const baseDate = new Date("2026-01-15T10:00:00.000Z");

function makeApp(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    _id: { toString: () => baseId },
    status: "applied",
    postId: "P-150126-001",
    applicantSnapshot: { name: "Alice", phone: "01700000000", email: "alice@example.com" },
    updatedAt: baseDate,
    ...overrides,
  };
}

function makeJobApp(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    _id: { toString: () => baseId },
    status: "applied",
    jobIdPublic: "J-150126-001",
    applicantSnapshot: { name: "Bob", phone: "01800000000", email: "bob@example.com" },
    updatedAt: baseDate,
    ...overrides,
  };
}

function makeEnquiry(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    _id: { toString: () => baseId },
    name: "Charlie",
    phoneNumber: "01900000000",
    query: "I need a tutor",
    currentStatus: "new",
    updatedAt: baseDate,
    ...overrides,
  };
}

function makeFeedback(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    _id: { toString: () => baseId },
    status: "open",
    category: "bug",
    subject: "App crashes",
    message: "The app crashes on login",
    userSnapshot: { name: "Dave", role: "teacher", email: "dave@example.com" },
    updatedAt: baseDate,
    ...overrides,
  };
}

function makeTodo(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    _id: { toString: () => baseId },
    category: "tuition",
    status: "demo_reminder",
    title: "Call guardian",
    dueAt: baseDate,
    isDone: false,
    updatedAt: baseDate,
    ...overrides,
  };
}

// ─── eventKey generation ──────────────────────────────────────────────────────

describe("eventKey generation", () => {
  it("generates tuition application key", () => {
    expect(tuitionApplicationEventKey(baseId)).toBe(`application:${baseId}:tuition`);
  });

  it("generates job application key", () => {
    expect(jobApplicationEventKey(baseId)).toBe(`application:${baseId}:job`);
  });

  it("generates enquiry key", () => {
    expect(enquiryEventKey(baseId)).toBe(`enquiry:${baseId}`);
  });

  it("generates feedback key", () => {
    expect(feedbackEventKey(baseId)).toBe(`feedback:${baseId}`);
  });

  it("generates todo key", () => {
    expect(todoEventKey(baseId)).toBe(`todo:${baseId}`);
  });
});

// ─── mapApplication ───────────────────────────────────────────────────────────

describe("mapApplication — tuition", () => {
  it("returns null for an application with neither postId nor jobIdPublic", () => {
    const result = mapApplication({ _id: { toString: () => baseId }, status: "applied", updatedAt: baseDate });
    expect(result).toBeNull();
  });

  it("maps a tuition application with 'applied' status", () => {
    const result = mapApplication(makeApp());
    expect(result).not.toBeNull();
    expect(result!.eventKey).toBe(`application:${baseId}:tuition`);
    expect(result!.category).toBe("tuition");
    expect(result!.rawStatus).toBe("applied");
    expect(result!.status).toBe("Demo Reminder");
    expect(result!.color).toBe("blue");
    expect(result!.startAt).toEqual(baseDate);
  });

  it("uses DC scheduled date when status is DC", () => {
    const dcDate = new Date("2026-02-01T09:00:00.000Z");
    const result = mapApplication(makeApp({
      status: "DC",
      dcMeta: { scheduledDate: dcDate, setByAdminId: { toString: () => "adminId1" } },
    }));
    expect(result!.status).toBe("Demo Confirmation");
    expect(result!.color).toBe("yellow");
    expect(result!.startAt).toEqual(dcDate);
  });

  it("uses GC scheduled date when status is GC", () => {
    const gcDate = new Date("2026-02-10T11:00:00.000Z");
    const result = mapApplication(makeApp({
      status: "GC",
      gcMeta: { scheduledDate: gcDate, setByAdminId: { toString: () => "adminId1" } },
    }));
    expect(result!.status).toBe("Guardian Confirmed");
    expect(result!.color).toBe("orange");
    expect(result!.startAt).toEqual(gcDate);
  });

  it("falls back to updatedAt when no scheduled date", () => {
    const result = mapApplication(makeApp({ status: "approved", approvalMeta: { approvedByAdminId: { toString: () => "adminId1" } } }));
    expect(result!.startAt).toEqual(baseDate);
    expect(result!.status).toBe("Completed");
    expect(result!.color).toBe("green");
  });

  it("maps auto_declined to red Declined", () => {
    const result = mapApplication(makeApp({ status: "auto_declined" }));
    expect(result!.status).toBe("Declined");
    expect(result!.color).toBe("red");
  });

  it("maps withdrawn to gray", () => {
    const result = mapApplication(makeApp({ status: "withdrawn" }));
    expect(result!.color).toBe("gray");
  });
});

describe("mapApplication — job", () => {
  it("maps a job application with 'applied' status", () => {
    const result = mapApplication(makeJobApp());
    expect(result).not.toBeNull();
    expect(result!.eventKey).toBe(`application:${baseId}:job`);
    expect(result!.category).toBe("job");
    expect(result!.status).toBe("Pending");
    expect(result!.color).toBe("orange");
  });

  it("maps a forwarded job application (DC/GC/approved) as Sent to Company blue", () => {
    for (const status of ["DC", "GC", "approved"]) {
      const result = mapApplication(makeJobApp({ status }));
      expect(result!.status).toBe("Sent to Company");
      expect(result!.color).toBe("blue");
    }
  });
});

// ─── mapEnquiry ───────────────────────────────────────────────────────────────

describe("mapEnquiry", () => {
  it("maps 'new' enquiry as Pending orange", () => {
    const result = mapEnquiry(makeEnquiry());
    expect(result.eventKey).toBe(`enquiry:${baseId}`);
    expect(result.category).toBe("enquiry");
    expect(result.status).toBe("Pending");
    expect(result.color).toBe("orange");
  });

  it("maps 'in_progress' as Pending yellow", () => {
    const result = mapEnquiry(makeEnquiry({ currentStatus: "in_progress" }));
    expect(result.color).toBe("yellow");
  });

  it("maps 'resolved' as Resolved green", () => {
    const result = mapEnquiry(makeEnquiry({ currentStatus: "resolved" }));
    expect(result.status).toBe("Resolved");
    expect(result.color).toBe("green");
  });

  it("maps 'closed' as Resolved gray", () => {
    const result = mapEnquiry(makeEnquiry({ currentStatus: "closed" }));
    expect(result.status).toBe("Resolved");
    expect(result.color).toBe("gray");
  });

  it("uses lastActionAt over updatedAt for startAt", () => {
    const actionDate = new Date("2026-03-01T08:00:00.000Z");
    const result = mapEnquiry(makeEnquiry({ lastActionAt: actionDate }));
    expect(result.startAt).toEqual(actionDate);
  });
});

// ─── mapFeedback ──────────────────────────────────────────────────────────────

describe("mapFeedback", () => {
  it("maps 'open' as Needs Review red", () => {
    const result = mapFeedback(makeFeedback());
    expect(result.eventKey).toBe(`feedback:${baseId}`);
    expect(result.category).toBe("feedback");
    expect(result.status).toBe("Needs Review");
    expect(result.color).toBe("red");
  });

  it("maps 'seen' as Under Review yellow", () => {
    const result = mapFeedback(makeFeedback({ status: "seen" }));
    expect(result.status).toBe("Under Review");
    expect(result.color).toBe("yellow");
  });

  it("maps 'resolved' as Resolved green", () => {
    const result = mapFeedback(makeFeedback({ status: "resolved" }));
    expect(result.status).toBe("Resolved");
    expect(result.color).toBe("green");
  });

  it("uses handledAt over updatedAt for startAt", () => {
    const handledDate = new Date("2026-04-01T08:00:00.000Z");
    const result = mapFeedback(makeFeedback({ handledAt: handledDate }));
    expect(result.startAt).toEqual(handledDate);
  });
});

// ─── mapTodo ──────────────────────────────────────────────────────────────────

describe("mapTodo", () => {
  it("maps a demo_reminder todo", () => {
    const result = mapTodo(makeTodo());
    expect(result.eventKey).toBe(`todo:${baseId}`);
    expect(result.category).toBe("reminder");
    expect(result.status).toBe("Demo Reminder");
    expect(result.color).toBe("yellow");
    expect(result.isDone).toBe(false);
  });

  it("overrides color to gray when isDone is true", () => {
    const result = mapTodo(makeTodo({ isDone: true }));
    expect(result.color).toBe("gray");
    expect(result.isDone).toBe(true);
    expect(result.title).toContain("✅ DONE");
  });

  it("maps pending enquiry todo as Pending orange", () => {
    const result = mapTodo(makeTodo({ category: "enquiry", status: "pending" }));
    expect(result.status).toBe("Pending");
    expect(result.color).toBe("orange");
  });

  it("maps action_taken feedback todo as Action Taken purple", () => {
    const result = mapTodo(makeTodo({ category: "feedback", status: "action_taken" }));
    expect(result.status).toBe("Action Taken");
    expect(result.color).toBe("purple");
  });

  it("uses dueAt for startAt", () => {
    const dueDate = new Date("2026-05-20T14:00:00.000Z");
    const result = mapTodo(makeTodo({ dueAt: dueDate }));
    expect(result.startAt).toEqual(dueDate);
  });
});
