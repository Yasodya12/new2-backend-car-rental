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
exports.resetPassword = exports.verifyOTP = exports.requestPasswordResetOTP = exports.authenticateUser = void 0;
const authService = __importStar(require("../service/auth.service"));
const email_1 = require("../utils/email");
const email_templates_1 = require("../utils/email.templates");
const authenticateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const authToken = yield authService.authenticateUser(email, password);
    if (!authToken) {
        return res.status(401).send({ error: "Invalid credentials" });
    }
    else {
        return res.status(200).send(authToken);
    }
});
exports.authenticateUser = authenticateUser;
// Request OTP for password reset
const requestPasswordResetOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ error: "Email is required" });
    }
    try {
        const result = yield authService.sendPasswordResetOTP(email);
        // Always return success message (for security, don't reveal if email exists)
        // But only send email if user exists
        if (result) {
            const html = (0, email_templates_1.otpEmailTemplate)(result.otp, result.userName);
            yield (0, email_1.sendEmail)(email, "Password Reset OTP 🔐", `Your OTP is: ${result.otp}`, html);
            return res.status(200).send({ message: "OTP has been sent to your email" });
        }
        else {
            // Still return success to prevent email enumeration
            return res.status(200).send({ message: "If the email exists, an OTP has been sent" });
        }
    }
    catch (error) {
        console.error("Error sending password reset OTP:", error);
        return res.status(500).send({ error: "Failed to send OTP" });
    }
});
exports.requestPasswordResetOTP = requestPasswordResetOTP;
// Verify OTP
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).send({ error: "Email and OTP are required" });
    }
    try {
        const isValid = yield authService.verifyPasswordResetOTP(email, otp);
        if (isValid) {
            return res.status(200).send({ message: "OTP verified successfully", valid: true });
        }
        else {
            return res.status(400).send({ error: "Invalid or expired OTP", valid: false });
        }
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).send({ error: "Failed to verify OTP" });
    }
});
exports.verifyOTP = verifyOTP;
// Reset password with OTP
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).send({ error: "Email, OTP, and new password are required" });
    }
    if (newPassword.length < 6) {
        return res.status(400).send({ error: "Password must be at least 6 characters long" });
    }
    try {
        const result = yield authService.resetPasswordWithOTP(email, otp, newPassword);
        if (result.success) {
            return res.status(200).send({ message: "Password reset successfully" });
        }
        else {
            return res.status(400).send({ error: result.error || "Failed to reset password" });
        }
    }
    catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).send({ error: "Failed to reset password" });
    }
});
exports.resetPassword = resetPassword;
