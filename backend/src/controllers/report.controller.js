import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { computeSettlement, computeSummary } from "../services/calculation.service.js";
import mongoose from "mongoose";

const populateOptions = () => [
  { path: "paidBy", select: "name image" },
  { path: "applicablePartners", select: "name image" },
  { path: "excludedPartners", select: "name image" },
  { path: "group", select: "name" },
];

const withPopulates = (query) => query.populate(populateOptions());

const requireMonth = (req) => {
  const { bsYear, bsMonth } = req.query;
  if (!bsYear || !bsMonth) throw new ApiError(400, "bsYear and bsMonth are required");
  return { bsYear: Number(bsYear), bsMonth: Number(bsMonth) };
};

export const monthlyReport = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = requireMonth(req);
  const { category, paidBy, group } = req.query;

  const filter = { bsYear, bsMonth };
  if (category) filter.category = category;
  if (paidBy) filter.paidBy = paidBy;
  if (group) filter.group = group;

  const expenses = await withPopulates(Expense.find(filter)).sort({ bsDate: -1 });
  const summary = computeSummary(expenses);

  return res.status(200).json({
    success: true,
    message: "Monthly report fetched successfully",
    expenses,
    summary,
  });
});

export const partnerReport = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = requireMonth(req);
  const { partnerId } = req.query;

  if (!partnerId || !mongoose.Types.ObjectId.isValid(partnerId)) {
    throw new ApiError(400, "Valid partnerId is required");
  }

  const partner = await Partner.findById(partnerId).select("-createdBy");
  if (!partner) throw new ApiError(404, "Partner not found");

  const filter = {
    bsYear,
    bsMonth,
    paidBy: partnerId,
  };

  const expenses = await withPopulates(Expense.find(filter)).sort({ bsDate: -1 });
  const summary = computeSummary(expenses);

  return res.status(200).json({
    success: true,
    message: "Partner report fetched successfully",
    partner,
    expenses,
    summary,
  });
});

export const categoryReport = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = requireMonth(req);
  const { category, group } = req.query;

  if (category && !["all", "primary", "secondary"].includes(category)) {
    throw new ApiError(400, "Category must be all, primary or secondary");
  }

  const filter = { bsYear, bsMonth };
  if (category && category !== "all") filter.category = category;
  if (group) filter.group = group;

  const expenses = await withPopulates(
    Expense.find(filter)
  ).sort({ bsDate: -1 });

  const summary = computeSummary(expenses);

  return res.status(200).json({
    success: true,
    message: "Category report fetched successfully",
    expenses,
    summary,
  });
});

export const settlementReport = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = requireMonth(req);

  const [activePartners, expenses] = await Promise.all([
    Partner.find({ status: "active" }).select("name image").sort({ createdAt: -1 }),
    Expense.find({ bsYear, bsMonth }).select("amount category group paidBy applicablePartners"),
  ]);

  const settlement = computeSettlement(expenses, activePartners);

  return res.status(200).json({
    success: true,
    message: "Settlement report fetched successfully",
    ...settlement,
  });
});
