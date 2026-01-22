import Notification from "../model/notification.model";

/**
 * Create a new notification
 */
export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: "Info" | "Success" | "Warning" | "Error" = "Info",
    link?: string
) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            link,
            isRead: false
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

/**
 * Get all unread notifications for a user
 */
export const getUnreadNotifications = async (userId: string) => {
    return Notification.find({ userId, isRead: false })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
};

/**
 * Get all notifications for a user (with pagination)
 */
export const getAllNotifications = async (
    userId: string,
    page: number = 1,
    limit: number = 20
) => {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Notification.countDocuments({ userId });

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string, userId: string) => {
    return Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
    );
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string) => {
    return Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: string) => {
    return Notification.countDocuments({ userId, isRead: false });
};

/**
 * Delete old read notifications (cleanup utility)
 */
export const deleteOldNotifications = async (daysOld: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return Notification.deleteMany({
        isRead: true,
        createdAt: { $lt: cutoffDate }
    });
};
