import { Request, Response } from 'express';
import { AuthRequest } from '../types/common.types';
import * as authService from '../service/auth.service';
import { sendEmail } from '../utils/email';
import { otpEmailTemplate } from '../utils/email.templates';
import User from '../model/user.model';
import bcrypt from 'bcryptjs';

export const authenticateUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const authToken = await authService.authenticateUser(email, password)
    if (!authToken) {
        return res.status(401).send({ error: "Invalid credentials" });
    } else {
        return res.status(200).send(authToken);
    }
}

// Request OTP for password reset
export const requestPasswordResetOTP = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ error: "Email is required" });
    }

    try {
        const result = await authService.sendPasswordResetOTP(email);

        // Always return success message (for security, don't reveal if email exists)
        // But only send email if user exists
        if (result) {
            const html = otpEmailTemplate(result.otp, result.userName);
            await sendEmail(email, "Password Reset OTP 🔐", `Your OTP is: ${result.otp}`, html);
            return res.status(200).send({ message: "OTP has been sent to your email" });
        } else {
            // Still return success to prevent email enumeration
            return res.status(200).send({ message: "If the email exists, an OTP has been sent" });
        }
    } catch (error) {
        console.error("Error sending password reset OTP:", error);
        return res.status(500).send({ error: "Failed to send OTP" });
    }
}

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).send({ error: "Email and OTP are required" });
    }

    try {
        const isValid = await authService.verifyPasswordResetOTP(email, otp);

        if (isValid) {
            return res.status(200).send({ message: "OTP verified successfully", valid: true });
        } else {
            return res.status(400).send({ error: "Invalid or expired OTP", valid: false });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).send({ error: "Failed to verify OTP" });
    }
}

// Reset password with OTP
export const resetPassword = async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).send({ error: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).send({ error: "Password must be at least 6 characters long" });
    }

    try {
        const result = await authService.resetPasswordWithOTP(email, otp, newPassword);

        if (result.success) {
            return res.status(200).send({ message: "Password reset successfully" });
        } else {
            return res.status(400).send({ error: result.error || "Failed to reset password" });
        }
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).send({ error: "Failed to reset password" });
    }
}

// Change password (authenticated)
export const changePassword = async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    // req.user is populated by authenticateToken middleware
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
        return res.status(400).send({ error: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).send({ error: "New password must be at least 6 characters long" });
    }

    try {
        const result = await authService.changePassword(userId, oldPassword, newPassword);

        if (result.success) {
            return res.status(200).send({ message: "Password changed successfully" });
        } else {
            return res.status(400).send({ error: result.error || "Failed to change password" });
        }
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).send({ error: "Failed to change password" });
    }
}

// Emergency: Create admin when database is empty
export const createEmergencyAdmin = async (req: Request, res: Response) => {
    try {
        // Check if any admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(409).send({ 
                error: "Admin user already exists. This endpoint can only be used when no admin exists." 
            });
        }

        const { name, email, password, contactNumber } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).send({ 
                error: "Name, email, and password are required" 
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).send({ 
                error: "Password must be at least 8 characters long" 
            });
        }

        // Check if email already in use
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).send({ 
                error: "Email is already in use" 
            });
        }

        // Hash password and create admin
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const newAdmin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            contactNumber: contactNumber || '',
            isApproved: true,
            walletBalance: 0,
        });

        return res.status(201).send({ 
            message: "Admin user created successfully",
            user: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });

    } catch (error: any) {
        console.error("Error creating emergency admin:", error);
        return res.status(500).send({ 
            error: error.message || "Failed to create admin user" 
        });
    }
}
