import { Router } from "express";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const notificationRouter = Router();

notificationRouter.use(verifyJWT);

notificationRouter.get("/", getNotifications);
notificationRouter.put("/:id/read", markNotificationRead);
notificationRouter.put("/read-all", markAllNotificationsRead);