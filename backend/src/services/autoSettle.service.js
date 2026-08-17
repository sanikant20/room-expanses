import cron from "node-cron";
import NepaliDateModule from "nepali-date-converter";
import { Expense } from "../models/expense.model.js";
import { Settlement } from "../models/settlement.model.js";
import { settleAllCascade } from "./settlement.service.js";

const NepaliDate = NepaliDateModule.default || NepaliDateModule;

const AUTO_SETTLE_CRON = "15 8 * * *";
const AUTO_SETTLE_TIMEZONE = "Asia/Kathmandu";

/**
 * Returns today's BS date as { bsYear, bsMonth, bsDay }.
 */
const getTodayBsDate = () => {
  const today = new NepaliDate();
  return {
    bsYear: today.getYear(),
    bsMonth: today.getMonth() + 1,
    bsDay: today.getDate(),
  };
};

/**
 * Settles a single BS month across all scopes.
 */
const settleMonth = async (bsYear, bsMonth, source) => {
  const alreadySettled = await Settlement.findOne({
    bsYear,
    bsMonth,
    category: null,
    group: null,
  });
  if (alreadySettled) return null;

  console.log(`[auto-settle] ${source}: settling ${bsYear}/${bsMonth}`);

  const results = await settleAllCascade({
    year: bsYear,
    month: bsMonth,
    settledBy: null,
  });

  const summary = results.map(({ scope, group, alreadySettled: done }) => ({
    scope,
    group: group ? String(group) : null,
    alreadySettled: done,
  }));
  console.log(`[auto-settle] ${bsYear}/${bsMonth} done: ${JSON.stringify(summary)}`);
  return summary;
};

/**
 * Two-pronged auto-settle:
 *
 * 1. **Cron trigger** (daily at 00:30): When today is BS day 1, the
 *    previous BS month has ended — settle it.
 *
 * 2. **Startup catch-up**: Scans for any unsettled BS month where
 *    expenses exist for the NEXT month (proving the calendar moved on).
 *    This catches months missed while the server was down.
 */
export const startAutoSettleJob = () => {
  const runByBsDate = async () => {
    try {
      const { bsYear, bsMonth, bsDay } = getTodayBsDate();
      if (bsDay !== 1) return;

      // Previous month
      const prevMonth = bsMonth === 1
        ? { bsYear: bsYear - 1, bsMonth: 12 }
        : { bsYear, bsMonth: bsMonth - 1 };

      await settleMonth(prevMonth.bsYear, prevMonth.bsMonth, "cron");
    } catch (error) {
      console.error("[auto-settle] Cron settle failed:", error);
    }
  };

  const runCatchUp = async () => {
    try {
      const unsettledMonths = await Expense.aggregate([
        { $match: { settled: false } },
        { $group: { _id: { bsYear: "$bsYear", bsMonth: "$bsMonth" } } },
      ]);

      for (const { _id } of unsettledMonths) {
        const { bsYear, bsMonth } = _id;
        const nextMonth = bsMonth >= 12
          ? { bsYear: bsYear + 1, bsMonth: 1 }
          : { bsYear, bsMonth: bsMonth + 1 };

        const nextHasExpenses = await Expense.exists({
          bsYear: nextMonth.bsYear,
          bsMonth: nextMonth.bsMonth,
        });
        if (!nextHasExpenses) continue;

        await settleMonth(bsYear, bsMonth, "startup catch-up");
      }
    } catch (error) {
      console.error("[auto-settle] Catch-up settle failed:", error);
    }
  };

  // Run both on startup so any missed months are caught up immediately
  runByBsDate();
  runCatchUp();

  // Schedule daily cron
  cron.schedule(AUTO_SETTLE_CRON, runByBsDate, { timezone: AUTO_SETTLE_TIMEZONE });

  console.log(`[auto-settle] Scheduled (${AUTO_SETTLE_CRON} ${AUTO_SETTLE_TIMEZONE}) + runs on startup`);
};
