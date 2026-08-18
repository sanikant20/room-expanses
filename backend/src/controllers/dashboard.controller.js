import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { Settlement } from "../models/settlement.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  aggregateMonthlyTrend,
  computePartnerSummaries,
  computePayerTotals,
  computeSummary,
  findHighestPayer,
  findLowestPayer,
  subtractBsMonths,
} from "../services/calculation.service.js";

export const getSummary = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = req.query;

  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }

  const year = Number(bsYear);
  const month = Number(bsMonth);

  const monthsToFetch = 6;
  const period = [];
  for (let i = 0; i < monthsToFetch; i++) {
    period.push(subtractBsMonths(year, month, i));
  }

  const [activePartners, expenses, trendExpenses, settlementRecord] = await Promise.all([
    Partner.find({ status: "active" }).select("name image").sort({ createdAt: -1 }),
    Expense.find({ bsYear: year, bsMonth: month }),
    Expense.find({
      $or: period.map(({ bsYear: y, bsMonth: m }) => ({ bsYear: y, bsMonth: m })),
    }).select("amount bsYear bsMonth category paidBy applicablePartners"),
    Settlement.findOne({
      bsYear: year,
      bsMonth: month,
      category: null,
      group: null,
    }).populate("settledBy", "name email"),
  ]);

  const referencedIds = new Set();
  for (const expense of expenses) {
    if (expense.paidBy) referencedIds.add(String(expense.paidBy));
    for (const id of expense.applicablePartners || []) referencedIds.add(String(id));
  }

  const referencedPartnerQuery = referencedIds.size > 0
    ? Partner.find({ _id: { $in: [...referencedIds] } }).select("name image")
    : Promise.resolve([]);
  const referencedPartners = await referencedPartnerQuery;

  const partnerById = new Map();
  for (const partner of [...activePartners, ...referencedPartners]) {
    partnerById.set(String(partner._id), partner);
  }
  const monthPartners = [...partnerById.values()];

  const summary = computeSummary(expenses);
  const partnerSummaries = computePartnerSummaries(expenses, monthPartners);
  const payerTotals = computePayerTotals(expenses, monthPartners);
  const monthlyTrend = aggregateMonthlyTrend(trendExpenses, period);

  const settlementStatus = settlementRecord
    ? {
        status: settlementRecord.status,
        settledBy: settlementRecord.settledBy,
        settledAt: settlementRecord.settledAt,
      }
    : null;

  return res.status(200).json({
    success: true,
    message: "Dashboard summary fetched successfully",
    bsYear: year,
    bsMonth: month,
    ...summary,
    partnerCount: activePartners.length,
    partnerSummaries,
    payerTotals,
    categoryBreakdown: [
      { name: "Primary", value: summary.primaryTotal },
      { name: "Secondary", value: summary.secondaryTotal },
    ],
    highestPayer: findHighestPayer(payerTotals),
    lowestPayer: findLowestPayer(payerTotals),
    monthlyTrend,
    settlementStatus,
  });
});
