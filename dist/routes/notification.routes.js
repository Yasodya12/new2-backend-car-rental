"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRoutes = (0, express_1.Router)();
// Get unread notifications
notificationRoutes.get("/unread", notification_controller_1.getUnreadNotifications);
// Get all notifications with pagination
notificationRoutes.get("/all", notification_controller_1.getAllNotifications);
// Get unread count
notificationRoutes.get("/count", notification_controller_1.getUnreadCount);
// Mark specific notification as read
notificationRoutes.put("/:id/read", notification_controller_1.markNotificationAsRead);
// Mark all notifications as read
notificationRoutes.put("/read-all", notification_controller_1.markAllNotificationsAsRead);
exports.default = notificationRoutes;
