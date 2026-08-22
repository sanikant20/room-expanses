import { Router } from "express";
import {
  deleteExpiredNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const notificationRouter = Router();

notificationRouter.use(verifyJWT);

notificationRouter.get("/", getNotifications);
notificationRouter.put("/read-all", markAllNotificationsRead);
notificationRouter.put("/:id/read", markNotificationRead);
notificationRouter.delete("/read/expired", deleteExpiredNotifications);
notificationRouter.delete("/:id", deleteNotification);