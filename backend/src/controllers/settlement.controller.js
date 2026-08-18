import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { Settlement } from "../models/settlement.model.js";
import { Group } from "../models/group.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import {
  computeSettlement,
  computeSummary,
  expenseShares,
  fromPaise,
  round2,
} from "../services/calculation.service.js";
import {
  revertAllCascade,
  revertScope,
  settleAllCascade,
  settleScope,
} from "../services/settlement.service.js";

const populateOptions = () => [
  { path: "paidBy", select: "name image" },
  { path: "applicablePartners", select: "name image" },
];

const settlementPopulates = () => [
  { path: "settledBy", select: "name email" },
  { path: "group", select: "name" },
  { path: "transactions.from", select: "name image" },
  { path: "transactions.to", select: "name image" },
  { path: "settleActions.settledBy", select: "name email" },
  { path: "settleActions.transactions.from", select: "name image" },
  { path: "settleActions.transactions.to", select: "name image" },
];

const buildFilter = (req) => {
  const { bsYear, bsMonth, category, group } = req.query;
  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }
  const filter = { bsYear: Number(bsYear), bsMonth: Number(bsMonth) };
  if (category) filter.category = category;
  if (group) filter.group = group;
  return filter;
};

const resolveCategory = (value) =>
  value === "primary" || value === "secondary" ? value : null;

const resolveGroup = (value) =>
  value && mongoose.Types.ObjectId.isValid(value) ? value : null;

const resolveTransactionScope = (req) => {
  const { bsYear, bsMonth, from, to } = req.body;
  const category = resolveCategory(req.body.category);
  const group = resolveGroup(req.body.group);

  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }
  if (!from || !to) {
    throw new ApiError(400, "Transaction from and to partners are required");
  }

  return {
    year: Number(bsYear),
    month: Number(bsMonth),
    category,
    group,
    from: String(from),
    to: String(to),
  };
};

const updateTransactionPayment = async (scope, updates) => {
  const filter = {
    bsYear: scope.year,
    bsMonth: scope.month,
    status: "settled",
  };

  if (scope.category != null) filter.category = scope.category;
  if (scope.group != null) filter.group = scope.group;

  const setFields = {};
  for (const [key, value] of Object.entries(updates)) {
    setFields[`transactions.$[tx].${key}`] = value;
  }

  const result = await Settlement.updateMany(
    filter,
    { $set: setFields },
    { arrayFilters: [{ "tx.from": scope.from, "tx.to": scope.to }] }
  );

  if (!result.matchedCount) {
    throw new ApiError(404, "Settled transaction not found for this month");
  }
};

export const markTransactionPaid = asyncHandler(async (req, res) => {
  const scope = resolveTransactionScope(req);

  if (req.userType === "partner" && req.user._id.toString() !== scope.from) {
    throw new ApiError(403, "Only the paying partner can mark this transaction as paid");
  }

  await updateTransactionPayment(scope, {
    paymentStatus: "paid",
    paidAt: new Date(),
  });

  return res.status(200).json({
    success: true,
    message: "Transaction marked as paid",
  });
});

export const confirmTransactionReceipt = asyncHandler(async (req, res) => {
  const scope = resolveTransactionScope(req);

  if (req.userType === "partner" && req.user._id.toString() !== scope.to) {
    throw new ApiError(403, "Only the receiving partner can confirm this transaction");
  }

  const baseFilter = {
    bsYear: scope.year,
    bsMonth: scope.month,
    status: "settled",
    "transactions.from": scope.from,
    "transactions.to": scope.to,
  };

  if (scope.category != null) baseFilter.category = scope.category;
  if (scope.group != null) baseFilter.group = scope.group;

  const record = await Settlement.findOne(baseFilter);

  if (!record) {
    throw new ApiError(404, "Settled transaction not found for this month");
  }

  const transaction = (record.transactions || []).find(
    (tx) => String(tx.from?._id || tx.from) === scope.from && String(tx.to?._id || tx.to) === scope.to
  );
  if (!transaction) {
    throw new ApiError(404, "Settled transaction not found for this month");
  }
  if (transaction.paymentStatus !== "paid") {
    throw new ApiError(409, "The payer has not marked this transaction as paid yet");
  }

  await updateTransactionPayment(scope, {
    paymentStatus: "confirmed",
    confirmedAt: new Date(),
    confirmedBy: req.user?._id || null,
    confirmedByType: req.userType || null,
  });

  return res.status(200).json({
    success: true,
    message: "Transaction confirmed as received",
  });
});

export const resetTransactionPayment = asyncHandler(async (req, res) => {
  const scope = resolveTransactionScope(req);

  await updateTransactionPayment(scope, {
    paymentStatus: "pending",
    paidAt: null,
    confirmedAt: null,
    confirmedBy: null,
    confirmedByType: null,
  });

  return res.status(200).json({
    success: true,
    message: "Transaction payment status reset",
  });
});

const fetchSettlementRecord = (bsYear, bsMonth, category = null, group = null) =>
  Settlement.findOne({ bsYear, bsMonth, category, group }).populate(settlementPopulates());

const fetchSecondaryAggregatedStatus = async (bsYear, bsMonth) => {
  const activeGroups = await Group.find({ status: "active" }).sort({ createdAt: -1 });
  if (activeGroups.length === 0) return { status: "pending" };

  const records = await Settlement.find({
    bsYear,
    bsMonth,
    category: "secondary",
    group: { $in: activeGroups.map((g) => g._id) },
  }).populate(settlementPopulates());

  const allSettled = records.length === activeGroups.length && records.every((r) => r.status === "settled");

  const transactions = records.flatMap((r) => r.transactions || []);
  const settleActions = records.flatMap((r) => r.settleActions || []);

  return {
    status: allSettled ? "settled" : "pending",
    transactions,
    settleActions,
    records,
  };
};

export const getSettlement = asyncHandler(async (req, res) => {
  const filter = buildFilter(req);

  const activePartners = await Partner.find({ status: "active" }).sort({ createdAt: -1 });
  const expenses = await Expense.find(filter);

  const settlement = computeSettlement(expenses, activePartners);

  const category = resolveCategory(req.query.category);
  const group = resolveGroup(req.query.group);
  const bsYear = Number(req.query.bsYear);
  const bsMonth = Number(req.query.bsMonth);

  let isSettled = false;
  let aggregatedTransactions = null;
  let aggregatedSettleActions = null;
  let settledMeta = {};

  if (category === null) {
    const primaryRecord = await fetchSettlementRecord(bsYear, bsMonth, "primary", null);
    const secondaryStatus = await fetchSecondaryAggregatedStatus(bsYear, bsMonth);
    isSettled = !!primaryRecord && secondaryStatus.status === "settled";
    aggregatedTransactions = secondaryStatus.transactions || [];
    aggregatedSettleActions = secondaryStatus.settleActions || [];
    if (primaryRecord?.transactions) {
      aggregatedTransactions = [...primaryRecord.transactions, ...aggregatedTransactions];
    }
    if (primaryRecord?.settleActions) {
      aggregatedSettleActions = [...primaryRecord.settleActions, ...aggregatedSettleActions];
    }
    if (primaryRecord) {
      settledMeta = { settledBy: primaryRecord.settledBy, settledAt: primaryRecord.settledAt, fromDate: primaryRecord.fromDate, toDate: primaryRecord.toDate };
    }
  } else if (category === "secondary" && !group) {
    const secondaryStatus = await fetchSecondaryAggregatedStatus(bsYear, bsMonth);
    isSettled = secondaryStatus.status === "settled";
    aggregatedTransactions = secondaryStatus.transactions || [];
    aggregatedSettleActions = secondaryStatus.settleActions || [];
    if (isSettled && secondaryStatus.records?.length) {
      const ref = secondaryStatus.records[0];
      settledMeta = { settledBy: ref.settledBy, settledAt: ref.settledAt, fromDate: ref.fromDate, toDate: ref.toDate };
    }
  } else {
    const record = await fetchSettlementRecord(bsYear, bsMonth, category, group);
    isSettled = record?.status === "settled";
    aggregatedTransactions = record?.transactions || null;
    aggregatedSettleActions = record?.settleActions || null;
    if (record) {
      settledMeta = { settledBy: record.settledBy, settledAt: record.settledAt, fromDate: record.fromDate, toDate: record.toDate };
    }
  }

  for (const row of settlement.rows) {
    row.settled = isSettled;
  }

  const hasScopeFilter = category || group;
  if (hasScopeFilter) {
    settlement.rows = settlement.rows.filter(
      (row) => row.paid > 0 || row.expected > 0
    );
  }

  return res.status(200).json({
    success: true,
    message: "Settlement fetched successfully",
    ...settlement,
    settlement: {
      status: isSettled ? "settled" : "pending",
      transactions: aggregatedTransactions,
      settleActions: aggregatedSettleActions,
      ...settledMeta,
    },
  });
});

export const getCalculations = asyncHandler(async (req, res) => {
  const filter = buildFilter(req);

  const expenses = await Expense.find(filter)
    .populate(populateOptions())
    .populate("group", "name")
    .sort({ bsDate: -1 });

  const rows = expenses.map((expense) => {
    const shares = expenseShares(expense);
    const partners = (expense.applicablePartners || []).map((partner) => ({
      _id: partner._id,
      name: partner.name,
      image: partner.image,
      share: round2(fromPaise(shares.get(partner._id.toString()) || 0)),
    }));
    return {
      _id: expense._id,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      group: expense.group,
      bsDate: expense.bsDate,
      paidBy: expense.paidBy,
      partners,
    };
  });

  return res.status(200).json({
    success: true,
    message: "Calculations fetched successfully",
    rows,
    summary: computeSummary(expenses),
  });
});

const settleIfAllSubScopesSettled = async (year, month, settledBy) => {
  const primaryRecord = await Settlement.findOne({
    bsYear: year,
    bsMonth: month,
    category: "primary",
    group: null,
    status: "settled",
  });
  if (!primaryRecord) return false;

  const activeGroups = await Group.find({ status: "active" }).sort({ createdAt: -1 });
  if (activeGroups.length === 0) return false;

  for (const g of activeGroups) {
    const groupRecord = await Settlement.findOne({
      bsYear: year,
      bsMonth: month,
      category: "secondary",
      group: g._id,
      status: "settled",
    });
    if (!groupRecord) return false;
  }

  const existingAll = await Settlement.findOne({
    bsYear: year,
    bsMonth: month,
    category: null,
    group: null,
  });
  if (existingAll) return false;

  await settleScope({ year, month, category: null, group: null, settledBy });
  return true;
};

export const settleMonth = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = req.body;
  const category = resolveCategory(req.body.category);
  const group = resolveGroup(req.body.group);

  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }

  const year = Number(bsYear);
  const month = Number(bsMonth);

  if (category === null) {
    const existingAll = await Settlement.findOne({
      bsYear: year,
      bsMonth: month,
      category: null,
      group: null,
    });
    if (existingAll && existingAll.status === "settled") {
      throw new ApiError(409, "Settlement for this month is already settled");
    }

    await settleAllCascade({ year, month, settledBy: req.user?._id });

    return res.status(200).json({
      success: true,
      message: "Settlement marked as settled successfully (all scopes)",
    });
  }

  if (category === "secondary" && !group) {
    const activeGroups = await Group.find({ status: "active" }).sort({ createdAt: -1 });

    if (activeGroups.length === 0) {
      throw new ApiError(400, "No active secondary groups found");
    }

    let settledAny = false;
    for (const g of activeGroups) {
      const { alreadySettled } = await settleScope({
        year,
        month,
        category: "secondary",
        group: g._id,
        settledBy: req.user?._id,
      });
      if (!alreadySettled) settledAny = true;
    }

    if (!settledAny) {
      throw new ApiError(409, "All secondary groups are already settled");
    }

    const allCreated = await settleIfAllSubScopesSettled(year, month, req.user?._id);

    return res.status(200).json({
      success: true,
      message: allCreated
        ? `Settled ${activeGroups.length} secondary group(s) and All (combined) successfully`
        : `Settled ${activeGroups.length} secondary group(s) successfully`,
    });
  }

  const { alreadySettled } = await settleScope({
    year,
    month,
    category,
    group,
    settledBy: req.user?._id,
  });
  if (alreadySettled) {
    throw new ApiError(409, "Settlement for this month is already settled");
  }

  const allCreated = await settleIfAllSubScopesSettled(year, month, req.user?._id);

  return res.status(200).json({
    success: true,
    message: allCreated
      ? "Settlement marked as settled successfully. All (combined) scope also settled."
      : "Settlement marked as settled successfully",
  });
});

export const revertSettlement = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = req.body;
  const category = resolveCategory(req.body.category);
  const group = resolveGroup(req.body.group);

  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }

  const year = Number(bsYear);
  const month = Number(bsMonth);

  if (category === null) {
    const results = await revertAllCascade({ year, month });
    const revertedAny = results.some(({ reverted }) => reverted);
    if (!revertedAny) {
      throw new ApiError(404, "No settled record found for this month");
    }
    return res.status(200).json({
      success: true,
      message: "Settlement reverted successfully (all scopes)",
      settlement: null,
    });
  }

  const revertStaleAllRecord = async () => {
    await Settlement.deleteOne({ bsYear: year, bsMonth: month, category: null, group: null });
  };

  if (category === "secondary" && !group) {
    const groupIds = await Settlement.distinct("group", {
      bsYear: year,
      bsMonth: month,
      category: "secondary",
      group: { $ne: null },
    });

    if (groupIds.length === 0) {
      throw new ApiError(404, "No secondary settlements found for this month");
    }

    let revertedAny = false;
    for (const groupId of groupIds) {
      const { reverted } = await revertScope({ year, month, category: "secondary", group: groupId });
      if (reverted) revertedAny = true;
    }

    if (!revertedAny) {
      throw new ApiError(404, "No settled secondary groups found for this month");
    }

    await revertStaleAllRecord();

    return res.status(200).json({
      success: true,
      message: `Reverted ${groupIds.length} secondary group(s) successfully`,
      settlement: null,
    });
  }

  const { reverted } = await revertScope({ year, month, category, group });
  if (!reverted) {
    throw new ApiError(404, "No settled record found for this month");
  }

  await revertStaleAllRecord();

  return res.status(200).json({
    success: true,
    message: "Settlement reverted successfully",
    settlement: null,
  });
});
