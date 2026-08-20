import { TurnRotation } from "../models/turnRotation.model.js";
import { TurnEvent } from "../models/turnEvent.model.js";
import { Partner } from "../models/partner.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { computeTurnState, completeTurn } from "../services/turn.service.js";
import { notifyNextTurnPartner } from "../services/notification.service.js";
import mongoose from "mongoose";

const eventPopulates = () => [
  { path: "assignedPartner", select: "name image" },
  { path: "broughtByPartner", select: "name image" },
];

const rotationPopulates = () => [
  { path: "partners", select: "name image status" },
];

const resolveType = (req, fallback = "water") => {
  const type = req?.query?.type || req?.body?.type || fallback;
  return ["water", "rice", "cleaning"].includes(type) ? type : fallback;
};

const typeLabels = {
  water: { noun: "water", rotation: "water rotation" },
  rice: { noun: "rice", rotation: "rice rotation" },
  cleaning: { noun: "cleaning", rotation: "cleaning rotation" },
};

const fetchActiveRotation = (type = "water") =>
  TurnRotation.findOne({ type, status: "active" }).populate(rotationPopulates());

const fetchEvents = (rotationId) =>
  TurnEvent.find({ rotation: rotationId }).populate(eventPopulates()).sort({ createdAt: 1 });

const partnerSummary = (partner) =>
  partner
    ? {
        _id: partner._id,
        name: partner.name,
        image: partner.image,
        status: partner.status,
      }
    : null;

const buildStateResponse = (rotation, events, requesterId = null, requesterType = null) => {
  const state = computeTurnState({ rotation, events });

  const myStatus = (() => {
    if (!requesterId) return null;
    if (requesterType !== "partner") return null;
    const id = String(requesterId);
    const isMember = (rotation?.partners || []).some((p) => String(p._id) === id);
    if (!isMember) return { inRotation: false, fulfilled: false };
    const fulfilled = state.completed.some((p) => String(p._id) === id);
    return { inRotation: true, fulfilled, isCurrentTurn: state.current && String(state.current._id) === id };
  })();

  const lastCompleted = events.length ? events[events.length - 1] : null;

  return {
    rotation: {
      _id: rotation?._id || null,
      type: rotation?.type || "water",
      configured: !!rotation,
      partners: (rotation?.partners || []).map(partnerSummary),
    },
    cycle: state.cycle,
    currentTurn: partnerSummary(state.current),
    nextTurn: partnerSummary(state.next),
    pending: state.pending.map(partnerSummary),
    completed: state.completed.map(partnerSummary),
    lastCompleted: lastCompleted
      ? {
          assignedPartner: partnerSummary(lastCompleted.assignedPartner),
          broughtByPartner: partnerSummary(lastCompleted.broughtByPartner),
          completedAt: lastCompleted.createdAt,
        }
      : null,
    myStatus,
  };
};

export const getTurnState = asyncHandler(async (req, res) => {
  const type = resolveType(req);
  const rotation = await fetchActiveRotation(type);
  if (!rotation) {
    return res.status(200).json({
      success: true,
      message: "Turn fetched successfully",
      ...buildStateResponse(null, []),
    });
  }

  const events = await fetchEvents(rotation._id);
  return res.status(200).json({
    success: true,
    message: "Turn fetched successfully",
    ...buildStateResponse(rotation, events, req.user?._id, req.userType),
  });
});

export const getPublicTurnState = asyncHandler(async (req, res) => {
  const type = resolveType(req);
  const rotation = await fetchActiveRotation(type);
  if (!rotation) {
    return res.status(200).json({
      success: true,
      message: "Turn fetched successfully",
      ...buildStateResponse(null, []),
    });
  }

  const events = await fetchEvents(rotation._id);
  return res.status(200).json({
    success: true,
    message: "Turn fetched successfully",
    ...buildStateResponse(rotation, events),
  });
});

export const getTurnHistory = asyncHandler(async (req, res) => {
  const type = resolveType(req);
  const rotation = await fetchActiveRotation(type);
  if (!rotation) {
    return res.status(200).json({ success: true, message: "No turn history", cycles: [] });
  }

  const events = await fetchEvents(rotation._id);

  const byCycle = {};
  for (const event of events) {
    const cycle = Number(event.cycle);
    if (!byCycle[cycle]) byCycle[cycle] = [];
    byCycle[cycle].push({
      _id: event._id,
      assignedPartner: partnerSummary(event.assignedPartner),
      broughtByPartner: partnerSummary(event.broughtByPartner),
      completedAt: event.createdAt,
    });
  }

  const cycles = Object.keys(byCycle)
    .map(Number)
    .sort((a, b) => a - b)
    .map((cycle) => ({ cycle, events: byCycle[cycle] }));

  return res.status(200).json({ success: true, message: "Turn history fetched successfully", cycles });
});

export const createTurn = asyncHandler(async (req, res) => {
  const type = resolveType(req);
  const { partners = [] } = req.body;

  if (!Array.isArray(partners) || partners.length === 0) {
    throw new ApiError(400, "At least one partner is required");
  }

  const uniqueIds = [...new Set(partners.map((id) => String(id)))];
  if (uniqueIds.length !== partners.length) {
    throw new ApiError(400, "Duplicate partners are not allowed");
  }

  const validIds = uniqueIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length !== uniqueIds.length) {
    throw new ApiError(400, "Invalid partner id provided");
  }

  const count = await Partner.countDocuments({ _id: { $in: validIds } });
  if (count !== validIds.length) {
    throw new ApiError(400, "One or more partners do not exist");
  }

  await TurnRotation.updateMany({ type, status: "active" }, { $set: { status: "inactive" } });

  const rotation = await TurnRotation.create({
    type,
    partners: validIds,
    status: "active",
    createdBy: req.user?._id,
  });

  return res.status(201).json({
    success: true,
    message: "Turn rotation created successfully",
  });
});

export const updateTurn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { partners, status } = req.body;

  const rotation = await TurnRotation.findById(id);
  if (!rotation) {
    throw new ApiError(404, "Turn rotation not found");
  }

  const updates = {};
  if (status !== undefined) {
    if (!["active", "inactive"].includes(status)) {
      throw new ApiError(400, "Status must be active or inactive");
    }
    updates.status = status;
    if (status === "active") {
      await TurnRotation.updateMany(
        { _id: { $ne: rotation._id }, type: rotation.type, status: "active" },
        { $set: { status: "inactive" } }
      );
    }
  }

  if (Array.isArray(partners)) {
    if (partners.length === 0) {
      throw new ApiError(400, "At least one partner is required");
    }
    const uniqueIds = [...new Set(partners.map((id) => String(id)))];
    if (uniqueIds.length !== partners.length) {
      throw new ApiError(400, "Duplicate partners are not allowed");
    }
    const validIds = uniqueIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== uniqueIds.length) {
      throw new ApiError(400, "Invalid partner id provided");
    }
    const count = await Partner.countDocuments({ _id: { $in: validIds } });
    if (count !== validIds.length) {
      throw new ApiError(400, "One or more partners do not exist");
    }
    updates.partners = validIds;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  await TurnRotation.findByIdAndUpdate(id, updates);

  return res.status(200).json({
    success: true,
    message: "Turn rotation updated successfully",
  });
});

export const completeTurnAction = asyncHandler(async (req, res) => {
  const type = resolveType(req);
  const labels = typeLabels[type] || typeLabels.water;
  const rotation = await fetchActiveRotation(type);
  if (!rotation) {
    throw new ApiError(400, `No active ${labels.rotation} configured`);
  }

  const state = computeTurnState({ rotation, events: await fetchEvents(rotation._id) });

  let broughtByPartner;
  let assignedPartner;

  if (req.userType === "partner") {
    broughtByPartner = req.user._id;
    assignedPartner = state.current ? state.current._id : req.user._id;
  } else {
    const { partnerId } = req.body;
    if (!partnerId) {
      throw new ApiError(400, "partnerId is required when an admin records a completion");
    }
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      throw new ApiError(400, "Invalid partner id provided");
    }
    broughtByPartner = partnerId;
    assignedPartner = state.current ? state.current._id : partnerId;
  }

  const memberIds = (rotation.partners || []).map((p) => String(p._id));
  if (!memberIds.includes(String(broughtByPartner))) {
    throw new ApiError(403, `This partner is not part of the active ${labels.rotation}`);
  }

  const partnerRecord = await Partner.findById(broughtByPartner);
  if (!partnerRecord || partnerRecord.status !== "active") {
    throw new ApiError(403, "This partner is not active");
  }

  if (state.completed.some((p) => String(p._id) === String(broughtByPartner))) {
    throw new ApiError(409, `This partner has already fulfilled their ${labels.noun} obligation for this cycle`);
  }

  await completeTurn({
    rotation,
    cycle: state.cycle,
    assignedPartner,
    broughtByPartner,
    completedBy: req.user?._id,
  });

  const message =
    String(assignedPartner) === String(broughtByPartner)
      ? `${labels.rotation} completed successfully`
      : `${labels.noun[0].toUpperCase()}${labels.noun.slice(1)} brought for this turn recorded successfully`;

  if (req.userType === "partner") {
    const updatedEvents = await fetchEvents(rotation._id);
    notifyNextTurnPartner({ type, rotation, events: updatedEvents }).catch((e) =>
      console.error("[turn] next-partner notify failed:", e.message)
    );
  }

  return res.status(201).json({
    success: true,
    message,
  });
});

export const resetTurnEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "A valid eventId is required");
  }

  const deleted = await TurnEvent.findByIdAndDelete(eventId);
  if (!deleted) {
    throw new ApiError(404, "Turn event not found");
  }

  return res.status(200).json({
    success: true,
    message: "Turn event reset successfully",
  });
});