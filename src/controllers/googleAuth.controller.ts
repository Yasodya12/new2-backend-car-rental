import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../model/user.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = '305956686069-ogedh312p79n405acsrad4iqg76q9ki5.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    console.log("🔹 Google login request received");
    const { credential } = req.body;

    if (!credential) {
        console.error("❌ No credential provided in body");
        return res.status(400).send({ error: "Google credential is required" });
    }

    try {
        console.log("🔹 Verifying Google token...");
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            console.error("❌ Invalid Google token payload");
            return res.status(400).send({ error: "Invalid Google token" });
        }

        const { sub: googleId, email, name, picture } = payload;
        console.log(`✅ Token verified. User: ${email}`);

        if (!email) {
            console.error("❌ No email in Google token");
            return res.status(400).send({ error: "Email not provided by Google" });
        }

        // Check if user exists by googleId or email
        console.log("🔹 Finding user in DB...");
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            console.log("✅ User found, updating googleId if needed...");
            // User exists - update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
                console.log("✅ googleId linked to existing account");
            }
        } else {
            console.log("🔹 User not found, creating new account...");
            // New user - create account
            user = await User.create({
                googleId,
                email,
                name: name || email.split('@')[0],
                profileImage: picture,
                role: 'customer', // Default role for Google sign-up
                isApproved: true, // Auto-approve customers
            });
            console.log("✅ New user created");
        }

        // Generate JWT tokens
        console.log("🔹 Generating tokens...");
        const accessToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                profileImage: user.profileImage
            },
            JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY as any }
        );

        const refreshToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                profileImage: user.profileImage
            },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY as any }
        );

        // Check if profile is incomplete (missing NIC or contactNumber)
        const profileIncomplete = !user.nic || !user.contactNumber;
        console.log(`✅ Response ready. Profile incomplete: ${profileIncomplete}`);

        return res.status(200).send({
            accessToken,
            refreshToken,
            profileIncomplete
        });

    } catch (error: any) {
        console.error("❌ Google authentication error:", error);
        console.error("Error details:", error.message);
        return res.status(500).send({
            error: "Google authentication failed",
            details: error.message || "Unknown error"
        });
    }
};
