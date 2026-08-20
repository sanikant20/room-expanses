import { Notification } from "../models/notification.model.js";
import { Partner } from "../models/partner.model.js";
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
  if (partner?.email) {
    await sendEmail({ to: partner.email, subject: title, html: `<p>${message}</p>` });
  }
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