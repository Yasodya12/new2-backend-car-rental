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
exports.resetPasswordWithOTP = exports.verifyPasswordResetOTP = exports.sendPasswordResetOTP = exports.authenticateUser = void 0;
const user_model_1 = __importDefault(require("../model/user.model"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const resetTokenList = new Set();
// OTP storage: email -> { otp: string, expiresAt: number }
const otpStore = new Map();
const authenticateUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.default.findOne({ email }).select("+password");
    if (!existingUser) {
        return null;
    }
    const isValidPassword = yield bcryptjs_1.default.compare(password, existingUser.password);
    if (!isValidPassword) {
        return null;
    }
    else {
        const accessToken = jsonwebtoken_1.default.sign({ email: existingUser.email, name: existingUser.name, role: existingUser.role, profileImage: existingUser.profileImage }, JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ email: existingUser.email, name: existingUser.name, role: existingUser.role, profileImage: existingUser.profileImage }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        resetTokenList.add(refreshToken);
        return { accessToken, refreshToken };
    }
});
exports.authenticateUser = authenticateUser;
// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Send OTP for password reset
const sendPasswordResetOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.default.findOne({ email });
    if (!existingUser) {
        return null; // Don't reveal if email exists or not for security
    }
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    // Store OTP with expiration
    otpStore.set(email, { otp, expiresAt });
    return { otp, userName: existingUser.name };
});
exports.sendPasswordResetOTP = sendPasswordResetOTP;
// Verify OTP
const verifyPasswordResetOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
        return false; // No OTP found for this email
    }
    // Check if OTP has expired
    if (Date.now() > storedOtpData.expiresAt) {
        otpStore.delete(email); // Clean up expired OTP
        return false;
    }
    // Check if OTP matches
    if (storedOtpData.otp !== otp) {
        return false;
    }
    return true;
});
exports.verifyPasswordResetOTP = verifyPasswordResetOTP;
// Reset password after OTP verification
const resetPasswordWithOTP = (email, otp, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify OTP first
    const isValidOTP = yield (0, exports.verifyPasswordResetOTP)(email, otp);
    if (!isValidOTP) {
        return { success: false, error: "Invalid or expired OTP" };
    }
    // Check if user exists
    const existingUser = yield user_model_1.default.findOne({ email }).select("+password");
    if (!existingUser) {
        return { success: false, error: "User not found" };
    }
    // Hash new password
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    // Update password
    yield user_model_1.default.updateOne({ email }, { password: hashedPassword });
    // Remove OTP from store after successful password reset
    otpStore.delete(email);
    return { success: true };
});
exports.resetPasswordWithOTP = resetPasswordWithOTP;
