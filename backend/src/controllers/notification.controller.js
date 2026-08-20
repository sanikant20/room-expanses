import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";

const baseQuery = (req) => {
  if (req.userType === "partner") {
    return { partner: req.user._id };
  }
  return {};
};

export const getNotifications = asyncHandler(async (req, res) => {
  const query = baseQuery(req);
  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);

  const unreadCount = await Notification.countDocuments({ ...query, read: false });

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