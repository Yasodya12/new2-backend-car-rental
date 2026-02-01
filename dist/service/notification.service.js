"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldNotifications = exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getAllNotifications = exports.getUnreadNotifications = exports.createNotification = void 0;
const notification_model_1 = __importDefault(require("../model/notification.model"));
/**
 * Create a new notification
 */
const createNotification = (userId_1, title_1, message_1, ...args_1) => __awaiter(void 0, [userId_1, title_1, message_1, ...args_1], void 0, function* (userId, title, message, type = "Info", link) {
    try {
        const notification = yield notification_model_1.default.create({
            userId,
            title,
            message,
            type,
            link,
            isRead: false
        });
        return notification;
    }
    catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
});
exports.createNotification = createNotification;
/**
 * Get all unread notifications for a user
 */
const getUnreadNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return notification_model_1.default.find({ userId, isRead: false })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
});
exports.getUnreadNotifications = getUnreadNotifications;
/**
 * Get all notifications for a user (with pagination)
 */
const getAllNotifications = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const notifications = yield notification_model_1.default.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const total = yield notification_model_1.default.countDocuments({ userId });
    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
});
exports.getAllNotifications = getAllNotifications;
/**
 * Mark a notification as read
 */
const markAsRead = (notificationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return notification_model_1.default.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true }, { new: true });
});
exports.markAsRead = markAsRead;
/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return notification_model_1.default.updateMany({ userId, isRead: false }, { isRead: true });
});
exports.markAllAsRead = markAllAsRead;
/**
 * Get unread notification count for a user
 */
const getUnreadCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return notification_model_1.default.countDocuments({ userId, isRead: false });
});
exports.getUnreadCount = getUnreadCount;
/**
 * Delete old read notifications (cleanup utility)
 */
const deleteOldNotifications = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return notification_model_1.default.deleteMany({
        isRead: true,
        createdAt: { $lt: cutoffDate }
    });
});
exports.deleteOldNotifications = deleteOldNotifications;
