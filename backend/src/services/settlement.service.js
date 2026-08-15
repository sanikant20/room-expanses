import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { Settlement } from "../models/settlement.model.js";
import { computeSettlement, computeTransactions } from "./calculation.service.js";

const settlementPopulates = () => [
  { path: "settledBy", select: "name email" },
  { path: "group", select: "name" },
  { path: "transactions.from", select: "name image" },
  { path: "transactions.to", select: "name image" },
];

const dateRangeFilter = (fromDate, toDate) => {
  if (fromDate && toDate) {
    return { bsDate: { $gte: fromDate, $lte: toDate } };
  }
  return {};
};

const scopeExpenseFilter = ({ year, month, category = null, group = null, fromDate = null, toDate = null }) => ({
  bsYear: year,
  bsMonth: month,
  ...(category ? { category } : {}),
  ...(group ? { group } : {}),
  ...dateRangeFilter(fromDate, toDate),
});

/**
 * Settles a single scope (bsYear, bsMonth, category, group).
 * Optionally restricted to a BS date range (fromDate/toDate in "YYYY/MM/DD").
 * Marks every affected expense as settled and links it to the record.
 * Returns { record, alreadySettled }.
 */
export const settleScope = async ({ year, month, category = null, group = null, fromDate = null, toDate = null, settledBy = null }) => {
  const existing = await Settlement.findOne({ bsYear: year, bsMonth: month, category, group });
  if (existing && existing.status === "settled") {
    return { record: existing, alreadySettled: true };
  }

  const filter = scopeExpenseFilter({ year, month, category, group, fromDate, toDate });
  const activePartners = await Partner.find({ status: "active" }).sort({ createdAt: -1 });
  const expenses = await Expense.find(filter);

  const settlement = computeSettlement(expenses, activePartners);
  const transactions = computeTransactions(settlement.rows);
  const now = new Date();

  const record = await Settlement.findOneAndUpdate(
    { bsYear: year, bsMonth: month, category, group },
    {
      bsYear: year,
      bsMonth: month,
      category,
      group,
      fromDate,
      toDate,
      status: "settled",
      settledBy,
      settledAt: now,
      transactions,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate(settlementPopulates());

  await Expense.updateMany(filter, {
    settled: true,
    settlementId: record._id,
    settledAt: now,
  });

  return { record, alreadySettled: false };
};

/**
 * Reverts a single scope. Deletes the record and unsets the settled flag
 * on the expenses it covered (based on the stored fromDate/toDate, or the
 * full month when the record was a whole-month settlement).
 * Returns { reverted }.
 */
export const revertScope = async ({ year, month, category = null, group = null }) => {
  const record = await Settlement.findOneAndDelete({ bsYear: year, bsMonth: month, category, group });
  if (!record) return { reverted: false };

  const filter = scopeExpenseFilter({
    year,
    month,
    category,
    group,
    fromDate: record.fromDate || null,
    toDate: record.toDate || null,
  });

  await Expense.updateMany(filter, {
    settled: false,
    settlementId: null,
    settledAt: null,
  });

  return { reverted: true };
};

/**
 * Settles the whole month (or date range) across every scope:
 * All (combined), Primary, and each group's Secondary. Already-settled
 * sub-scopes are skipped. Used by the "All Summary" settle and the
 * auto-settle job.
 */
export const settleAllCascade = async ({ year, month, fromDate = null, toDate = null, settledBy = null }) => {
  const results = [];

  const all = await settleScope({ year, month, category: null, group: null, fromDate, toDate, settledBy });
  results.push({ scope: "all", alreadySettled: all.alreadySettled, record: all.record });

  const primary = await settleScope({ year, month, category: "primary", group: null, fromDate, toDate, settledBy });
  results.push({ scope: "primary", alreadySettled: primary.alreadySettled, record: primary.record });

  const groups = await Expense.distinct("group", {
    bsYear: year,
    bsMonth: month,
    category: "secondary",
    group: { $ne: null },
    ...dateRangeFilter(fromDate, toDate),
  });

  for (const groupId of groups) {
    const secondary = await settleScope({ year, month, category: "secondary", group: groupId, fromDate, toDate, settledBy });
    results.push({ scope: "secondary", group: groupId, alreadySettled: secondary.alreadySettled, record: secondary.record });
  }

  return results;
};

/**
 * Reverts the whole month across every scope that has a settled record.
 * Used by the "All Summary" revert.
 */
export const revertAllCascade = async ({ year, month }) => {
  const results = [];

  const all = await revertScope({ year, month, category: null, group: null });
  results.push({ scope: "all", reverted: all.reverted });

  const primary = await revertScope({ year, month, category: "primary", group: null });
  results.push({ scope: "primary", reverted: primary.reverted });

  const groupRecords = await Settlement.distinct("group", {
    bsYear: year,
    bsMonth: month,
    category: "secondary",
    group: { $ne: null },
  });

  for (const groupId of groupRecords) {
    const secondary = await revertScope({ year, month, category: "secondary", group: groupId });
    results.push({ scope: "secondary", group: groupId, reverted: secondary.reverted });
  }

  return results;
};
