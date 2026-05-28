# Calendar Single Source of Truth Plan

## Context

Today the calendar API derives events by querying multiple collections (applications, jobs, enquiries, feedback, todos, admins) and then mapping them into a single response. As those collections grow, the API call becomes slower because it has to query and join multiple datasets on every request.

## Goals

- Make calendar reads fast and predictable by querying a single collection.
- Keep event payload consistent and stable for the UI.
- Provide a clear propagation path from source collections into one calendar events store.
- Allow incremental backfills and low-risk rollout.

## Non-goals

- Redesigning all source schemas.
- Replacing the existing admin UI or calendar components.

## Proposed Single Source

Create a dedicated collection, `calendar_events`, that becomes the only read source for calendar views and refreshes.

### Suggested Schema (Mongoose)

```
CalendarEvent {
  _id: ObjectId,
  eventKey: string,             // unique deterministic key per source record
  source: {
    type: string,               // application | job | enquiry | feedback | todo
    collection: string,         // Application | Job | Enquiry | Feedback | TodoEvent
    sourceId: ObjectId | string,
    sourceUpdatedAt: Date
  },
  title: string,
  description: string,
  category: string,             // tuition | job | enquiry | feedback | reminder
  status: string,               // normalized UI status
  rawStatus: string,            // original status from source
  color: string,                // UI color token
  startAt: Date,
  endAt: Date,
  allDay: boolean,
  owner: {
    adminId: ObjectId | string | null,
    adminName: string | null
  },
  ref: {
    label: string | null,        // postId, enquiryId, jobId
    meta: Record<string, any>    // optional display metadata
  },
  isDone: boolean,               // mainly for reminder/todo
  visibility: string,            // admin | system
  lastSyncedAt: Date,
  syncVersion: number,           // bump when mapping changes
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- Unique: `eventKey`
- Range: `startAt`, `endAt`
- Filter: `owner.adminId + startAt`
- Filter: `category + startAt`
- Filter: `status + startAt`
- Source: `source.type + source.sourceId`
- Maintenance: `lastSyncedAt`, `syncVersion`

## Propagation Strategy

Use write-through updates from each source model into `calendar_events`, plus a backfill job for existing data.

### Option A (Recommended): Application-Level Write-Through

- Add a `CalendarEventService` with `upsertFromSource` and `deleteFromSource` methods.
- Call the service on create/update/delete paths for:
  - Applications (tuition and job apps)
  - Enquiries
  - Feedback
  - TodoEvent (manual reminders)
- For sources updated by scheduled jobs or external integrations, call the service in those handlers too.

### Option B (Supplementary): Change Streams

- Use MongoDB change streams to listen on source collections.
- A worker consumes change events and updates `calendar_events`.
- Keep application-level write-through to avoid reliance on change stream availability.

## Mapping Rules

- Preserve a deterministic `eventKey`, for example:
  - `application:<_id>:tuition`
  - `application:<_id>:job`
  - `enquiry:<_id>`
  - `feedback:<_id>`
  - `todo:<_id>`
- Store `rawStatus` and map to normalized `status` and `color` using the same rules as today.
- Normalize `startAt` and `endAt` exactly once at write time.

## Backfill Plan

- Add a one-time backfill script:
  - Read each source collection in batches.
  - Map to `CalendarEvent` using the same service.
  - Upsert by `eventKey` to avoid duplicates.
- Add incremental backfill for last N days if needed.

## Read Path Changes

- Update `/api/admin/calendar-events` to query `calendar_events` only.
- Support date range query params and default to a bounded window (for example, 90 days past to 90 days future).
- Optionally add filters for `owner.adminId` and `category`.

## Consistency and Error Handling

- Keep `lastSyncedAt` and `syncVersion` on each event.
- If an update fails, log the source and retry via a queued job.
- If a source record is deleted, mark the event as deleted or remove it by `eventKey`.

## Rollout Steps

1. Add `CalendarEvent` model and indexes.
2. Create `CalendarEventService` with mapping logic and tests.
3. Add write-through hooks in all source write paths.
4. Backfill existing data.
5. Switch `/api/admin/calendar-events` to read from `calendar_events`.
6. Remove old aggregation logic after verifying parity.

## Validation

- Compare counts per category between old API and new collection.
- Sample events by source type and verify titles, dates, and owners.
- Measure API response time before and after.

