import { Router } from "express";
import {
    getUnreadNotifications,
    getAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount
} from "../controllers/notification.controller";

const notificationRoutes: Router = Router();

// Get unread notifications
notificationRoutes.get("/unread", getUnreadNotifications);

// Get all notifications with pagination
notificationRoutes.get("/all", getAllNotifications);

// Get unread count
notificationRoutes.get("/count", getUnreadCount);

// Mark specific notification as read
notificationRoutes.put("/:id/read", markNotificationAsRead);

// Mark all notifications as read
notificationRoutes.put("/read-all", markAllNotificationsAsRead);

export default notificationRoutes;
