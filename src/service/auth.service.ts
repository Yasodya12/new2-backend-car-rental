import User from "../model/user.model";
import { UserDTO } from "../dto/user.data";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

const resetTokenList = new Set<string>();

// OTP storage: email -> { otp: string, expiresAt: number }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const authenticateUser = async (email: string, password: string) => {


    const existingUser: UserDTO | null = await User.findOne({ email }).select("+password");
    if (!existingUser) {
        return null;
    }
    if (!existingUser.password) {
        return null; // Google users don't have passwords
    }
    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
        return null;
    } else {
        const accessToken = jwt.sign({ id: existingUser._id, email: existingUser.email, name: existingUser.name, role: existingUser.role, profileImage: existingUser.profileImage }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY as any });
        const refreshToken = jwt.sign({ id: existingUser._id, email: existingUser.email, name: existingUser.name, role: existingUser.role, profileImage: existingUser.profileImage }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY as any });
        resetTokenList.add(refreshToken);
        return { accessToken, refreshToken };
    }
}

// Generate a 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP for password reset
export const sendPasswordResetOTP = async (email: string) => {
    const existingUser: UserDTO | null = await User.findOne({ email });
    if (!existingUser) {
        return null; // Don't reveal if email exists or not for security
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Store OTP with expiration
    otpStore.set(email, { otp, expiresAt });

    return { otp, userName: existingUser.name };
}

// Verify OTP
export const verifyPasswordResetOTP = async (email: string, otp: string): Promise<boolean> => {
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
}

// Reset password after OTP verification
export const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string) => {
    // Verify OTP first
    const isValidOTP = await verifyPasswordResetOTP(email, otp);
    if (!isValidOTP) {
        return { success: false, error: "Invalid or expired OTP" };
    }

    // Check if user exists
    const existingUser: UserDTO | null = await User.findOne({ email }).select("+password");
    if (!existingUser) {
        return { success: false, error: "User not found" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updateOne(
        { email },
        { password: hashedPassword }
    );

    // Remove OTP from store after successful password reset
    otpStore.delete(email);

    return { success: true };
}

// Change password (for logged-in users)
export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
    // Get user with password
    const user: UserDTO | null = await User.findById(userId).select("+password");
    if (!user) {
        return { success: false, error: "User not found" };
    }

    if (!user.password) {
        return { success: false, error: "This account uses Google Sign-In" };
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return { success: false, error: "Incorrect current password" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return { success: true };
}