#!/usr/bin/env node
import dotenv from "dotenv";

// Load local env first so `MONGODB_URI` is available to db.ts
dotenv.config({ path: ".env.local" });

async function upsertDefaults() {
  const { default: dbConnect } = await import("@/lib/db");
  const { subjects, sourceLists } = await import("@/lib/validations/forms");
  const Subject = (await import("@/lib/models/Subject")).default;
  const Source = (await import("@/lib/models/Source")).default;

  await dbConnect();

  for (const s of subjects) {
    const exists = await Subject.findOne({ key: s.key }).lean();
    if (!exists) {
      await Subject.create({ key: s.key, label: s.label });
      console.log(`Inserted subject: ${s.key}`);
    }
  }

  for (const s of sourceLists) {
    const exists = await Source.findOne({ key: s.key }).lean();
    if (!exists) {
      await Source.create({ key: s.key, label: s.label });
      console.log(`Inserted source: ${s.key}`);
    }
  }

  console.log("Seeding completed.");
  process.exit(0);
}

upsertDefaults().catch((err) => {
  console.error(err);
  process.exit(1);
});
