import { TurnEvent } from "../models/turnEvent.model.js";
import { ApiError } from "../utils/ApiError.js";

const idOf = (doc) => String(doc?._id || doc);

/**
 * Computes the deterministic turn state for a rotation given its ordered
 * partner list (populated) and its completion events.
 *
 * Rules:
 * - A partner's obligation for a cycle is fulfilled when that partner is the
 *   `broughtByPartner` of an event in the cycle.
 * - The current turn is the first active partner in rotation order whose
 *   obligation is not yet fulfilled in the current cycle.
 * - When every active partner has fulfilled their obligation in the latest
 *   cycle, the cycle advances to the next number and all partners reset.
 *
 * Returns { cycle, current, next, pending, completed }.
 */
export const computeTurnState = ({ rotation, events = [] }) => {
  const partners = (rotation?.partners || []).filter(Boolean);
  const activePartners = partners.filter((p) => p?.status === "active");

  if (activePartners.length === 0) {
    return {
      cycle: 1,
      current: null,
      next: null,
      pending: [],
      completed: [],
      partners,
    };
  }

  const maxCycle = events.reduce((max, e) => Math.max(max, Number(e.cycle) || 0), 0);

  const completedInCycle = (cycle) =>
    new Set(
      events
        .filter((e) => Number(e.cycle) === cycle)
        .map((e) => idOf(e.broughtByPartner))
    );

  const latestCompleted = completedInCycle(maxCycle);
  const allDone = activePartners.every((p) => latestCompleted.has(idOf(p)));

  const cycle = allDone ? maxCycle + 1 : Math.max(maxCycle, 1);
  const completed = allDone ? [] : activePartners.filter((p) => latestCompleted.has(idOf(p)));

  const pending = activePartners.filter((p) => !completed.some((c) => idOf(c) === idOf(p)));

  return {
    cycle,
    current: pending[0] || null,
    next: pending[1] || null,
    pending,
    completed,
    partners,
  };
};

/**
 * Records that `broughtByPartner` carried water for the current scheduled turn
 * (`assignedPartner`) in the current cycle. Fulfills the bringer's obligation;
 * the scheduled turn partner stays pending unless they were the bringer.
 */
export const completeTurn = async ({ rotation, cycle, assignedPartner, broughtByPartner, completedBy = null }) => {
  let event;
  try {
    event = await TurnEvent.create({
      rotation: rotation._id,
      cycle,
      assignedPartner,
      broughtByPartner,
      completedBy,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "This partner has already fulfilled their water obligation for this cycle");
    }
    throw error;
  }
  return event;
};