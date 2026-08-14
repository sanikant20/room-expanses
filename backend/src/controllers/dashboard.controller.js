import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  aggregateMonthlyTrend,
  computePartnerSummaries,
  computeSummary,
  findHighestSpender,
  findLowestSpender,
  subtractBsMonths,
} from "../services/calculation.service.js";

export const getSummary = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth } = req.query;

  if (!bsYear || !bsMonth) {
    throw new ApiError(400, "bsYear and bsMonth are required");
  }

  const year = Number(bsYear);
  const month = Number(bsMonth);

  const activePartners = await Partner.find({ status: "active" }).sort({ createdAt: -1 });
  const expenses = await Expense.find({ bsYear: year, bsMonth: month });

  const summary = computeSummary(expenses);
  const partnerSummaries = computePartnerSummaries(expenses, activePartners);

  // Fetch expenses for the last 6 months (including the selected month) for the trend chart.
  const monthsToFetch = 6;
  const period = [];
  for (let i = 0; i < monthsToFetch; i++) {
    period.push(subtractBsMonths(year, month, i));
  }

  const trendExpenses = await Expense.find({
    $or: period.map(({ bsYear: y, bsMonth: m }) => ({ bsYear: y, bsMonth: m })),
  });

  const monthlyTrend = aggregateMonthlyTrend(trendExpenses);

  return res.status(200).json({
    success: true,
    message: "Dashboard summary fetched successfully",
    bsYear: year,
    bsMonth: month,
    ...summary,
    partnerCount: activePartners.length,
    partnerSummaries,
    categoryBreakdown: [
      { name: "Primary", value: summary.primaryTotal },
      { name: "Secondary", value: summary.secondaryTotal },
    ],
    highestSpender: findHighestSpender(partnerSummaries),
    lowestSpender: findLowestSpender(partnerSummaries),
    monthlyTrend,
  });
});
