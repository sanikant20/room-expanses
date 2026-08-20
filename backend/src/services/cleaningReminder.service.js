import cron from "node-cron";
import { TurnRotation } from "../models/turnRotation.model.js";
import { TurnEvent } from "../models/turnEvent.model.js";
import { Partner } from "../models/partner.model.js";
import { Notification } from "../models/notification.model.js";
import { computeTurnState } from "./turn.service.js";
import { sendEmail } from "./email.service.js";

const CLEANING_TIMEZONE = "Asia/Kathmandu";
const REMINDERS = {
  friday: {
    cron: "0 8 * * 5",
    refKeyPrefix: "cleaning-friday",
    title: "Cleaning turn tomorrow (Saturday)",
    message: "Hi {name}, don't forget — the flat cleaning is due tomorrow (Saturday). Please complete your cleaning turn from the app.",
  },
  saturday: {
    cron: "0 6 * * 6",
    refKeyPrefix: "cleaning-saturday",
    title: "Cleaning turn today",
    message: "Hi {name}, it's your turn to clean the flat today. Please complete your cleaning turn from the app.",
  },
};

const getKathmanduDateKey = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLEANING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
};

const getKathmanduWeekday = (now = new Date()) =>
  new Intl.DateTimeFormat("en-US", { timeZone: CLEANING_TIMEZONE, weekday: "short" }).format(now);

export const notifyCleaningPartner = async (day, now = new Date()) => {
  const cfg = REMINDERS[day];
  if (!cfg) return;

  const rotation = await TurnRotation.findOne({ type: "cleaning", status: "active" }).populate({
    path: "partners",
    select: "name image status",
  });

  if (!rotation) {
    console.log(`[cleaning-reminder] no active cleaning rotation — skipping (${day})`);
    return;
  }

  const events = await TurnEvent.find({ rotation: rotation._id }).sort({ createdAt: 1 });
  const state = computeTurnState({ rotation, events });
  const current = state.current;
  if (!current) {
    console.log(`[cleaning-reminder] no current partner — skipping (${day})`);
    return;
  }

  const dateKey = getKathmanduDateKey(now);
  const refKey = `${cfg.refKeyPrefix}-${dateKey}`;

  const alreadySent = await Notification.findOne({ refKey });
  if (alreadySent) {
    console.log(`[cleaning-reminder] already sent for ${refKey} — skipping`);
    return;
  }

  const partner = await Partner.findById(current._id).select("name email phone");

  const title = cfg.title;
  const message = cfg.message.replace("{name}", partner?.name || "partner");

  try {
    await Notification.create({
      partner: current._id,
      type: "cleaning",
      title,
      message,
      refKey,
    });
    console.log(`[cleaning-reminder] in-app notification created for ${current.name} (${refKey})`);
  } catch (error) {
    if (error?.code !== 11000) console.error("[cleaning-reminder] create failed:", error.message);
    return;
  }

  if (partner?.email) {
    await sendEmail({
      to: partner.email,
      subject: title,
      html: `<p>${message}</p>`,
    });
  }
};

export const startCleaningReminderJob = () => {
  // Startup catch-up: if the server was down during a scheduled run, fire now.
  // refKey dedup prevents duplicates. Friday (heads-up) and Saturday (day-of) are
  // caught up independently.
  const today = getKathmanduWeekday();
  if (today === "Fri") {
    notifyCleaningPartner("friday").catch((e) => console.error("[cleaning-reminder] startup run failed:", e.message));
  }
  if (today === "Sat") {
    notifyCleaningPartner("saturday").catch((e) => console.error("[cleaning-reminder] startup run failed:", e.message));
  }

  for (const [day, cfg] of Object.entries(REMINDERS)) {
    cron.schedule(cfg.cron, () => {
      notifyCleaningPartner(day).catch((e) => console.error(`[cleaning-reminder] ${day} run failed:`, e.message));
    }, { timezone: CLEANING_TIMEZONE });
  }

  console.log(`[cleaning-reminder] Scheduled (${Object.values(REMINDERS).map((c) => c.cron).join(", ")} ${CLEANING_TIMEZONE})`);
};