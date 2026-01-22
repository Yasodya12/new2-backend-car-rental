import { Request, Response } from "express";
import * as notificationService from "../service/notification.service";

/**
 * Get unread notifications for authenticated user
 */
export const getUnreadNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await notificationService.getUnreadNotifications(userId);

        res.status(200).json(notifications);
    } catch (error: any) {
        console.error("Error fetching unread notifications:", error);
        res.status(500).json({ error: error.message || "Failed to fetch notifications" });
    }
};

/**
 * Get all notifications for authenticated user with pagination
 */
export const getAllNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await notificationService.getAllNotifications(userId, page, limit);

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ error: error.message || "Failed to fetch notifications" });
    }
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notificationId = req.params.id;

        const updatedNotification = await notificationService.markAsRead(notificationId, userId);

        if (!updatedNotification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification: updatedNotification
        });
    } catch (error: any) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: error.message || "Failed to mark notification as read" });
    }
};

/**
 * Mark all notifications as read for authenticated user
 */
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const result = await notificationService.markAllAsRead(userId);

        res.status(200).json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: error.message || "Failed to mark all notifications as read" });
    }
};

/**
 * Get unread notification count for authenticated user
 */
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const count = await notificationService.getUnreadCount(userId);

        res.status(200).json({ count });
    } catch (error: any) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: error.message || "Failed to fetch unread count" });
    }
};
