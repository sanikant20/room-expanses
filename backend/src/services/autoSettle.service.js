import cron from "node-cron";
import NepaliDateModule from "nepali-date-converter";
import { settleAllCascade } from "./settlement.service.js";
import { subtractBsMonths } from "./calculation.service.js";

const NepaliDate = NepaliDateModule.default || NepaliDateModule;

const AUTO_SETTLE_CRON = "30 0 * * *";
const AUTO_SETTLE_TIMEZONE = "Asia/Kathmandu";

/**
 * Daily job: when today is the 1st day of a BS month, the previous BS month
 * has just ended — auto-settle it (All + Primary + each group's Secondary).
 * Expenses within that month get marked settled with no settledBy user,
 * which the UI reports as "Auto System".
 */
export const startAutoSettleJob = () => {
  cron.schedule(
    AUTO_SETTLE_CRON,
    async () => {
      try {
        const today = new NepaliDate();
        if (today.getDate() !== 1) return;

        const { bsYear, bsMonth } = subtractBsMonths(today.getYear(), today.getMonth() + 1, 1);
        console.log(`[auto-settle] Auto-settling previous month ${bsYear}/${bsMonth}...`);

        const results = await settleAllCascade({ year: bsYear, month: bsMonth, settledBy: null });

        const summary = results.map(({ scope, group, alreadySettled }) => ({
          scope,
          group: group ? String(group) : null,
          alreadySettled,
        }));
        console.log(`[auto-settle] Done: ${JSON.stringify(summary)}`);
      } catch (error) {
        console.error("[auto-settle] Failed to auto-settle:", error);
      }
    },
    { timezone: AUTO_SETTLE_TIMEZONE }
  );

  console.log(`[auto-settle] Job scheduled (${AUTO_SETTLE_CRON} ${AUTO_SETTLE_TIMEZONE})`);
};
