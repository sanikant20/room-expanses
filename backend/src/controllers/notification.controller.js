import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";

const DELETABLE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

const baseQuery = (req) => {
  if (req.userType === "partner") {
    return { partner: req.user._id };
  }
  return {};
};

export const getNotifications = asyncHandler(async (req, res) => {
  const query = baseQuery(req);
  const status = req.query?.status;
  if (status === "unread") {
    query.read = false;
  } else if (status === "read") {
    query.read = true;
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);

  const unreadCount = await Notification.countDocuments({ ...baseQuery(req), read: false });

  return res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    notifications,
    unreadCount,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (req.userType === "partner" && String(notification.partner) !== String(req.user._id)) {
    throw new ApiError(403, "You can only mark your own notifications");
  }

  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return res.status(200).json({ success: true, message: "Notification marked as read" });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const query = baseQuery(req);
  await Notification.updateMany(query, { $set: { read: true, readAt: new Date() } });

  return res.status(200).json({ success: true, message: "All notifications marked as read" });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (req.userType === "partner" && String(notification.partner) !== String(req.user._id)) {
    throw new ApiError(403, "You can only delete your own notifications");
  }

  if (!notification.read || !notification.readAt) {
    throw new ApiError(409, "Unread notifications cannot be deleted");
  }

  if (Date.now() - notification.readAt.getTime() < DELETABLE_AFTER_MS) {
    throw new ApiError(409, "Read notifications can be deleted thirty days after being read");
  }

  await notification.deleteOne();

  return res.status(200).json({ success: true, message: "Notification deleted" });
});

export const deleteExpiredNotifications = asyncHandler(async (req, res) => {
  const query = {
    ...baseQuery(req),
    read: true,
    readAt: { $ne: null, $lte: new Date(Date.now() - DELETABLE_AFTER_MS) },
  };
  const result = await Notification.deleteMany(query);

  return res.status(200).json({
    success: true,
    message: `${result.deletedCount} expired notifications deleted`,
    deletedCount: result.deletedCount,
  });
});