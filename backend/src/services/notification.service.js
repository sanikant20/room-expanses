import { Notification } from "../models/notification.model.js";
import { Partner } from "../models/partner.model.js";
import { Settlement } from "../models/settlement.model.js";
import { sendEmail } from "./email.service.js";
import { computeTurnState } from "./turn.service.js";

const labels = {
  water: { noun: "water", rotation: "water turn" },
  rice: { noun: "rice", rotation: "rice turn" },
  cleaning: { noun: "flat cleaning", rotation: "cleaning turn" },
};

const labelFor = (type) => labels[type] || labels.water;

/**
 * Creates an in-app notification for a partner and (best-effort) emails them.
 * Never throws — failures are logged so this can't break the completing request.
 */
export const notifyPartner = async ({ partnerId, type = "system", title, message, refKey = null }) => {
  try {
    const doc = { partner: partnerId, type, title, message };
    if (refKey) doc.refKey = refKey;
    await Notification.create(doc);
  } catch (error) {
    if (error?.code === 11000) {
      console.log(`[notify] duplicate refKey ${refKey} — skipping`);
      return;
    }
    console.error("[notify] in-app create failed:", error.message);
    return;
  }

  const partner = await Partner.findById(partnerId).select("name email phone").catch(() => null);
  if (!partner) {
    console.warn(`[notify] partner ${partnerId} not found — email skipped`);
    return;
  }
  if (!partner.email) {
    console.log(`[notify] partner "${partner.name}" has no email — in-app notification only`);
    return;
  }
  await sendEmail({ to: partner.email, subject: title, html: `<p>${message}</p>` });
};

/**
 * After a turn completes, notifies the next partner in rotation that it's now
 * their turn. Recomputes state from the events (including the new one) so the
 * next current partner is accurate. Emails are sent from the app's Resend
 * sender (EMAIL_FROM / onboarding fallback).
 */
export const notifyNextTurnPartner = async ({ type, rotation, events }) => {
  const label = labelFor(type);
  const state = computeTurnState({ rotation, events });
  const next = state.current;
  if (!next) return;

  const title = `Your ${label.rotation} now`;
  const message = `Hi ${next.name}, it's now your turn for the ${label.rotation}. Please complete it from the app.`;

  await notifyPartner({
    partnerId: next._id,
    type,
    title,
    message,
  });
};

export const BS_MONTHS = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

export const bsPeriodLabel = (month, year) => `${BS_MONTHS[month - 1]} ${year}`;

const money = (n) =>
  `Rs ${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const STATUS_COLORS = {
  pending: "#b45309",
  paid: "#047857",
  confirmed: "#1d4ed8",
};

/**
 * Builds the full-ledger email body — mirrors the app's Transactions tab
 * (every from → to → amount → status row for the settled month).
 */
const ledgerEmailHtml = ({ periodLabel, rows, settledAt }) => {
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const bodyRows = rows.length
    ? rows
        .map(
          (t, i) => `
          <tr style="background:${i % 2 ? "#f8fafc" : "#ffffff"};">
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#334155;">${esc(t.fromName)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#334155;">${esc(t.toName)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#0f172a;">${esc(money(t.amount))}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;text-transform:uppercase;font-size:12px;color:${STATUS_COLORS[t.paymentStatus] || "#64748b"};">${esc(t.paymentStatus)}</td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="4" style="padding:16px;text-align:center;color:#64748b;">No transactions — everyone settled even.</td></tr>`;

  const total = rows.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <div style="background:#4f46e5;color:#ffffff;padding:18px 24px;">
      <h2 style="margin:0;font-size:18px;">We Roomies — Settlement Completed</h2>
      <p style="margin:4px 0 0;font-size:13px;opacity:.9;">${esc(periodLabel)} &middot; combined (all partners) ledger</p>
    </div>
    <div style="padding:20px 24px;">
      <p style="margin:0 0 14px;color:#334155;font-size:14px;">
        The monthly settlement for <strong>${esc(periodLabel)}</strong> is complete.
        Below is the full transaction ledger, exactly as shown in the app's Transactions tab.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:10px 14px;text-align:left;color:#475569;">Pays (From)</th>
            <th style="padding:10px 14px;text-align:left;color:#475569;">Receives (To)</th>
            <th style="padding:10px 14px;text-align:right;color:#475569;">Amount</th>
            <th style="padding:10px 14px;text-align:center;color:#475569;">Status</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
        <tfoot>
          <tr style="background:#f1f5f9;">
            <td colspan="2" style="padding:10px 14px;font-weight:700;color:#0f172a;">Total to move</td>
            <td style="padding:10px 14px;text-align:right;font-weight:700;color:#0f172a;">${esc(money(total))}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <p style="margin:16px 0 0;color:#64748b;font-size:12px;line-height:1.5;">
        Settled at ${esc(settledAt)}. Payment statuses above reflect the live state —
        mark them paid/confirmed inside the We Roomies app.
      </p>
    </div>
  </div>`;
};

/**
 * After a month settles (manual or auto-settle), notifies every active
 * partner in-app and emails them the full ledger for the combined scope —
 * the same rows the Transactions tab shows. Best-effort: never throws.
 */
export const notifySettlementCompleted = async ({ year, month, source = "manual" }) => {
  try {
    const record = await Settlement.findOne({
      bsYear: year,
      bsMonth: month,
      category: null,
      group: null,
    }).populate([
      { path: "transactions.from", select: "name" },
      { path: "transactions.to", select: "name" },
    ]);
    if (!record) return;

    const partners = await Partner.find({ status: "active" }).select("name email");
    if (partners.length === 0) return;

    const periodLabel = `${BS_MONTHS[month - 1]} ${year}`;
    const rows = (record.transactions || []).map((t) => ({
      fromName: t.from?.name || "Unknown",
      toName: t.to?.name || "Unknown",
      amount: t.amount,
      paymentStatus: t.paymentStatus || "pending",
    }));
    const settledAt = record.settledAt
      ? new Date(record.settledAt).toLocaleString("en-IN", { timeZone: "Asia/Kathmandu" })
      : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kathmandu" });

    const title = `Settlement completed — ${periodLabel}`;
    const message =
      rows.length > 0
        ? `The ${periodLabel} settlement is done — ${rows.length} transaction(s), ${money(rows.reduce((s, t) => s + Number(t.amount || 0), 0))} in total. Check the Transactions tab for details.`
        : `The ${periodLabel} settlement is done — everyone came out even.`;
    const html = ledgerEmailHtml({ periodLabel, rows, settledAt });

    for (const partner of partners) {
      try {
        await Notification.create({
          partner: partner._id,
          type: source === "auto" ? "settlement-auto" : "settlement",
          title,
          message,
          refKey: `settlement-${year}-${month}-${partner._id}`,
        });
      } catch (error) {
        // Duplicate = this partner was already notified for this month
        // (e.g. cron raced a manual settle) — keep going, refresh their email.
        if (error?.code !== 11000) {
          console.error("[notify] settlement in-app create failed:", error.message);
        }
      }

      if (!partner.email) {
        console.log(`[notify] partner "${partner.name}" has no email — in-app notification only`);
        continue;
      }
      await sendEmail({ to: partner.email, subject: title, html }).catch((error) => {
        console.error(`[notify] settlement email failed for "${partner.name}":`, error.message);
      });
    }
  } catch (error) {
    console.error("[notify] settlement notification failed:", error.message);
  }
};