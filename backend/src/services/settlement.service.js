import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { Settlement } from "../models/settlement.model.js";
import { computeSettlement, computeTransactions } from "./calculation.service.js";

const settlementPopulates = () => [
  { path: "settledBy", select: "name email" },
  { path: "group", select: "name" },
  { path: "transactions.from", select: "name image" },
  { path: "transactions.to", select: "name image" },
  { path: "settleActions.settledBy", select: "name email" },
  { path: "settleActions.transactions.from", select: "name image" },
  { path: "settleActions.transactions.to", select: "name image" },
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
  const filter = scopeExpenseFilter({ year, month, category, group, fromDate, toDate });
  const unsettledFilter = { ...filter, settled: false };
  const existing = await Settlement.findOne({ bsYear: year, bsMonth: month, category, group });

  const unsettledCount = await Expense.countDocuments(unsettledFilter);
  if (existing && unsettledCount === 0) {
    return { record: existing, alreadySettled: true };
  }

  // Recompute over ALL covered expenses (already-settled + remaining) so the
  // stored who-pays-whom net reflects the whole month. When a scope record
  // does not exist yet (e.g. Primary/Secondary during an All Summary cascade
  // where the All scope already settled everything), the record is still
  // created so every scope is properly represented.
  const expenses = await Expense.find(filter);
  const activePartners = await Partner.find({ status: "active" }).sort({ createdAt: -1 });

  const settlement = computeSettlement(expenses, activePartners);
  const transactions = computeTransactions(settlement.rows);
  const now = new Date();

  const source = settledBy ? "manual" : "auto";

  const update = {
    $set: {
      bsYear: year,
      bsMonth: month,
      category,
      group,
      fromDate,
      toDate,
      status: "settled",
      settledBy: existing?.settledBy || settledBy,
      settledAt: now,
      transactions,
    },
  };

  if (unsettledCount > 0) {
    // Append a history entry per action (manual vs auto) so the portion each
    // settle run covered can be inspected separately in the Transactions tab.
    const remainingExpenses = await Expense.find(unsettledFilter);
    const remainingSettlement = computeSettlement(remainingExpenses, activePartners);
    update.$push = {
      settleActions: {
        source,
        settledBy,
        settledAt: now,
        fromDate,
        toDate,
        expenseCount: remainingExpenses.length,
        transactions: computeTransactions(remainingSettlement.rows),
      },
    };
  }

  const record = await Settlement.findOneAndUpdate(
    { bsYear: year, bsMonth: month, category, group },
    update,
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  ).populate(settlementPopulates());

  if (unsettledCount > 0) {
    await Expense.updateMany(unsettledFilter, {
      settled: true,
      settlementId: record._id,
      settledAt: now,
    });
  }

  return { record, alreadySettled: false, unsettledCount };
};

/**
 * A settlement is considered auto-settled when every recorded settle action
 * came from the auto-settle job (source "auto"). For legacy records without
 * a settleActions history, an unset settledBy means the auto job settled it.
 * Auto-settled settlements cannot be reverted.
 */
export const isAutoSettled = (record) => {
  if (!record) return false;
  if (Array.isArray(record.settleActions) && record.settleActions.length > 0) {
    return record.settleActions.every((action) => action.source === "auto");
  }
  return !record.settledBy;
};

/**
 * Reverts a single scope. Deletes the record and unsets the settled flag
 * on the expenses it covered (based on the stored fromDate/toDate, or the
 * full month when the record was a whole-month settlement).
 * Returns { reverted, blocked } — blocked is true for auto-settled scopes.
 */
export const revertScope = async ({ year, month, category = null, group = null }) => {
  const record = await Settlement.findOne({ bsYear: year, bsMonth: month, category, group });
  if (!record) return { reverted: false, blocked: false };

  if (isAutoSettled(record)) {
    return { reverted: false, blocked: true };
  }

  await record.deleteOne();

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

  return { reverted: true, blocked: false };
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
 * Used by the "All Summary" revert. If any scope is auto-settled, the whole
 * revert is blocked (no partial revert) and each affected scope is flagged.
 */
export const revertAllCascade = async ({ year, month }) => {
  const scopeDefs = [
    { scope: "all", category: null, group: null },
    { scope: "primary", category: "primary", group: null },
  ];

  const groupIds = await Settlement.distinct("group", {
    bsYear: year,
    bsMonth: month,
    category: "secondary",
    group: { $ne: null },
  });

  for (const groupId of groupIds) {
    scopeDefs.push({ scope: "secondary", category: "secondary", group: groupId });
  }

  const records = await Settlement.find({
    bsYear: year,
    bsMonth: month,
    $or: scopeDefs.map(({ category, group }) => ({ category, group })),
  });

  const autoSettledScopes = records.filter((record) => isAutoSettled(record));
  if (autoSettledScopes.length > 0) {
    return scopeDefs.map(({ scope, group }) => ({
      scope,
      group,
      reverted: false,
      blocked: true,
    }));
  }

  const results = [];
  for (const { scope, category, group } of scopeDefs) {
    const { reverted } = await revertScope({ year, month, category, group });
    results.push({ scope, group, reverted, blocked: false });
  }

  return results;
};
