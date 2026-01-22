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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEnhancedLoginNotification = exports.sendAdminNotification = exports.sendPasswordReset = exports.sendTripAssignment = exports.sendBookingConfirmation = void 0;
const email_1 = require("../utils/email");
const email_templates_1 = require("../utils/email.templates");
const sendBookingConfirmation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, customerName, tripId } = req.body;
    try {
        const subject = "Your Booking is Confirmed! 🎉";
        const html = (0, email_templates_1.bookingConfirmationTemplate)(customerName, tripId);
        yield (0, email_1.sendEmail)(to, subject, "", html);
        res.status(200).json({ message: "Booking confirmation email sent successfully" });
    }
    catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send booking confirmation email" });
    }
});
exports.sendBookingConfirmation = sendBookingConfirmation;
const sendTripAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, driverName, tripId, startLocation, endLocation, date } = req.body;
    try {
        const subject = "New Trip Assignment 🚚";
        const html = (0, email_templates_1.tripAssignmentTemplate)(driverName, tripId, startLocation, endLocation, date);
        yield (0, email_1.sendEmail)(to, subject, "", html);
        res.status(200).json({ message: "Trip assignment email sent successfully" });
    }
    catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send trip assignment email" });
    }
});
exports.sendTripAssignment = sendTripAssignment;
const sendPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, resetToken } = req.body;
    try {
        const subject = "Reset Your Password 🔐";
        const html = (0, email_templates_1.passwordResetTemplate)(resetToken);
        yield (0, email_1.sendEmail)(to, subject, "", html);
        res.status(200).json({ message: "Password reset email sent successfully" });
    }
    catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send password reset email" });
    }
});
exports.sendPasswordReset = sendPasswordReset;
const sendAdminNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, message } = req.body;
    try {
        const emailSubject = `Admin Alert: ${subject} 🔔`;
        const html = (0, email_templates_1.adminNotificationTemplate)(subject, message);
        yield (0, email_1.sendEmail)(to, emailSubject, "", html);
        res.status(200).json({ message: "Admin notification email sent successfully" });
    }
    catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send admin notification email" });
    }
});
exports.sendAdminNotification = sendAdminNotification;
const sendEnhancedLoginNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, message, userAgent } = req.body;
    const getClientIP = (req) => {
        var _a, _b;
        return (((_b = (_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) === null || _b === void 0 ? void 0 : _b.trim()) ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip ||
            'Unknown');
    };
    const ipAddress = getClientIP(req);
    const securityInfo = {
        userAgent: userAgent || req.headers['user-agent'] || 'Unknown',
        ipAddress: ipAddress,
        timestamp: new Date().toISOString(),
        referer: req.headers.referer || 'Direct',
        acceptLanguage: req.headers['accept-language'] || 'Unknown'
    };
    try {
        const emailSubject = subject || "🔐 Security Alert: New Login Detected";
        const enhancedMessage = `
            ${message}
            
            Login detected from a new session. If this was you, no action is needed.
            If you don't recognize this activity, please secure your account immediately.
        `;
        const html = (0, email_templates_1.loginNotificationTemplate)(enhancedMessage, securityInfo.userAgent, securityInfo.ipAddress);
        yield (0, email_1.sendEmail)(to, emailSubject, "", html);
        console.log(`Login notification sent to ${to}:`, {
            ip: securityInfo.ipAddress,
            userAgent: securityInfo.userAgent,
            timestamp: securityInfo.timestamp
        });
        res.status(200).json({
            message: "Enhanced login notification sent successfully",
            sentTo: to,
            securityInfo: {
                ipAddress: securityInfo.ipAddress,
                timestamp: securityInfo.timestamp
            }
        });
    }
    catch (error) {
        console.error("Enhanced login notification error:", error);
        res.status(500).json({
            message: "Failed to send login notification",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.sendEnhancedLoginNotification = sendEnhancedLoginNotification;
