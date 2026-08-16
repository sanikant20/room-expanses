import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const STALE_INDEX_NAME = "bsYear_1_bsMonth_1_category_1";

const dropStaleSettlementIndex = async () => {
  const db = mongoose.connection;
  const collection = db.collection("settlements");

  const indexes = await collection.indexes();
  const stale = indexes.find((idx) => idx.name === STALE_INDEX_NAME);

  if (!stale) {
    console.log(`✓ No stale index "${STALE_INDEX_NAME}" found — nothing to do.`);
    return;
  }

  console.log(`Stale index found: ${stale.name}`);
  console.log(`  keys: ${JSON.stringify(stale.key)}`);
  console.log(`  unique: ${Boolean(stale.unique)}`);

  await collection.dropIndex(STALE_INDEX_NAME);
  console.log(`✓ Dropped stale index "${STALE_INDEX_NAME}".`);
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
    console.log(`✅ Connected to ${process.env.DB_NAME}`);

    const before = await mongoose.connection.collection("settlements").indexes();
    console.log("Indexes before fix:");
    for (const idx of before) {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    }

    await dropStaleSettlementIndex();

    const after = await mongoose.connection.collection("settlements").indexes();
    console.log("Indexes after fix:");
    for (const idx of after) {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    }

    await mongoose.disconnect();
    console.log("✅ Repair script completed.");
  } catch (error) {
    console.error("❌ Repair failed:", error);
    process.exitCode = 1;
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
  }
};

run();
