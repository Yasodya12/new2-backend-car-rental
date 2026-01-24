"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getAllNotifications = exports.getUnreadNotifications = void 0;
const notificationService = __importStar(require("../service/notification.service"));
/**
 * Get unread notifications for authenticated user
 */
const getUnreadNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const notifications = yield notificationService.getUnreadNotifications(userId);
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Error fetching unread notifications:", error);
        res.status(500).json({ error: error.message || "Failed to fetch notifications" });
    }
});
exports.getUnreadNotifications = getUnreadNotifications;
/**
 * Get all notifications for authenticated user with pagination
 */
const getAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = yield notificationService.getAllNotifications(userId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ error: error.message || "Failed to fetch notifications" });
    }
});
exports.getAllNotifications = getAllNotifications;
/**
 * Mark a specific notification as read
 */
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        const updatedNotification = yield notificationService.markAsRead(notificationId, userId);
        if (!updatedNotification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        res.status(200).json({
            message: "Notification marked as read",
            notification: updatedNotification
        });
    }
    catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: error.message || "Failed to mark notification as read" });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
/**
 * Mark all notifications as read for authenticated user
 */
const markAllNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const result = yield notificationService.markAllAsRead(userId);
        res.status(200).json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    }
    catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: error.message || "Failed to mark all notifications as read" });
    }
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
/**
 * Get unread notification count for authenticated user
 */
const getUnreadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const count = yield notificationService.getUnreadCount(userId);
        res.status(200).json({ count });
    }
    catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: error.message || "Failed to fetch unread count" });
    }
});
exports.getUnreadCount = getUnreadCount;
