import { Request, Response } from "express";
import { sendEmail } from "../utils/email";
import {
    bookingConfirmationTemplate,
    tripAssignmentTemplate,
    passwordResetTemplate,
    adminNotificationTemplate,
    loginNotificationTemplate
} from "../utils/email.templates";

export const sendBookingConfirmation = async (req: Request, res: Response) => {
    const { to, customerName, tripId } = req.body;

    try {
        const subject = "Your Booking is Confirmed! 🎉";
        const html = bookingConfirmationTemplate(customerName, tripId);

        await sendEmail(to, subject, "", html);
        res.status(200).json({ message: "Booking confirmation email sent successfully" });
    } catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send booking confirmation email" });
    }
};

export const sendTripAssignment = async (req: Request, res: Response) => {
    const { to, driverName, tripId, startLocation, endLocation, date } = req.body;

    try {
        const subject = "New Trip Assignment 🚚";
        const html = tripAssignmentTemplate(driverName, tripId, startLocation, endLocation, date);

        await sendEmail(to, subject, "", html);
        res.status(200).json({ message: "Trip assignment email sent successfully" });
    } catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send trip assignment email" });
    }
};

export const sendPasswordReset = async (req: Request, res: Response) => {
    const { to, resetToken } = req.body;

    try {
        const subject = "Reset Your Password 🔐";
        const html = passwordResetTemplate(resetToken);

        await sendEmail(to, subject, "", html);
        res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send password reset email" });
    }
};

export const sendAdminNotification = async (req: Request, res: Response) => {
    const { to, subject, message } = req.body;

    try {
        const emailSubject = `Admin Alert: ${subject} 🔔`;
        const html = adminNotificationTemplate(subject, message);

        await sendEmail(to, emailSubject, "", html);
        res.status(200).json({ message: "Admin notification email sent successfully" });
    } catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Failed to send admin notification email" });
    }
};

export const sendEnhancedLoginNotification = async (req: Request, res: Response) => {
    const { to, subject, message, userAgent } = req.body;

    const getClientIP = (req: Request): string => {
        return (
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.headers['x-real-ip'] as string ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip ||
            'Unknown'
        );
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

        const html = loginNotificationTemplate(
            enhancedMessage,
            securityInfo.userAgent,
            securityInfo.ipAddress
        );

        await sendEmail(to, emailSubject, "", html);

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
    } catch (error) {
        console.error("Enhanced login notification error:", error);
        res.status(500).json({
            message: "Failed to send login notification",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};