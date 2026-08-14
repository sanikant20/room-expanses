import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { Settlement } from "../models/settlement.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  computeSettlement,
  computeSummary,
  computeTransactions,
  expenseShares,
  fromPaise,
  round2,
} from "../services/calculation.service.js";

const populateOptions = () => [
  { path: "paidBy", select: "name image" },
  { path: "applicablePartners", select: "name image" },
];

const settlementPopulates = () => [
  { path: "settledBy", select: "name email" },
  { path: "transactions.from", select: "name image" },
  { path: "transactions.to", select: "name image" },
];

const buildFilter = (req) => {
  const { bsYear, bsMonth, category } = req.query;
  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }
  const filter = { bsYear: Number(bsYear), bsMonth: Number(bsMonth) };
  if (category) filter.category = category;
  return filter;
};

const resolveCategory = (value) =>
  value === "primary" || value === "secondary" ? value : null;

const fetchSettlementRecord = (bsYear, bsMonth, category = null) =>
  Settlement.findOne({ bsYear, bsMonth, category }).populate(settlementPopulates());

export const getSettlement = asyncHandler(async (req, res) => {
  const filter = buildFilter(req);

  const activePartners = await Partner.find({ status: "active" }).sort({ createdAt: -1 });
  const expenses = await Expense.find(filter);

  const settlement = computeSettlement(expenses, activePartners);
  const record = await fetchSettlementRecord(
    Number(req.query.bsYear),
    Number(req.query.bsMonth),
    resolveCategory(req.query.category)
  );

  return res.status(200).json({
    success: true,
    message: "Settlement fetched successfully",
    ...settlement,
    settlement: record,
  });
});

export const getCalculations = asyncHandler(async (req, res) => {
  const filter = buildFilter(req);

  const expenses = await Expense.find(filter)
    .populate(populateOptions())
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

export const settleMonth = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = req.body;
  const category = resolveCategory(req.body.category);

  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }

  const year = Number(bsYear);
  const month = Number(bsMonth);

  const existing = await Settlement.findOne({ bsYear: year, bsMonth: month, category });
  if (existing && existing.status === "settled") {
    throw new ApiError(409, "Settlement for this month is already settled");
  }

  const activePartners = await Partner.find({ status: "active" }).sort({ createdAt: -1 });
  const expenses = await Expense.find({
    bsYear: year,
    bsMonth: month,
    ...(category ? { category } : {}),
  });

  const settlement = computeSettlement(expenses, activePartners);
  const transactions = computeTransactions(settlement.rows);

  const record = await Settlement.findOneAndUpdate(
    { bsYear: year, bsMonth: month, category },
    {
      bsYear: year,
      bsMonth: month,
      category,
      status: "settled",
      settledBy: req.user?._id,
      settledAt: new Date(),
      transactions,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate(settlementPopulates());

  return res.status(200).json({
    success: true,
    message: "Settlement marked as settled successfully",
    settlement: record,
  });
});

export const revertSettlement = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = req.body;
  const category = resolveCategory(req.body.category);

  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }

  const year = Number(bsYear);
  const month = Number(bsMonth);

  const record = await Settlement.findOneAndDelete({ bsYear: year, bsMonth: month, category });
  if (!record) {
    throw new ApiError(404, "No settled record found for this month");
  }

  return res.status(200).json({
    success: true,
    message: "Settlement reverted successfully",
    settlement: null,
  });
});
