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
exports.googleLogin = void 0;
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = __importDefault(require("../model/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GOOGLE_CLIENT_ID = '305956686069-ogedh312p79n405acsrad4iqg76q9ki5.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔹 Google login request received");
    const { credential } = req.body;
    if (!credential) {
        console.error("❌ No credential provided in body");
        return res.status(400).send({ error: "Google credential is required" });
    }
    try {
        console.log("🔹 Verifying Google token...");
        // Verify the Google token
        const ticket = yield client.verifyIdToken({
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
        let user = yield user_model_1.default.findOne({
            $or: [{ googleId }, { email }]
        });
        if (user) {
            console.log("✅ User found, updating googleId if needed...");
            // User exists - update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                yield user.save();
                console.log("✅ googleId linked to existing account");
            }
        }
        else {
            console.log("🔹 User not found, creating new account...");
            // New user - create account
            user = yield user_model_1.default.create({
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
        const accessToken = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage
        }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage
        }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
        // Check if profile is incomplete (missing NIC or contactNumber)
        const profileIncomplete = !user.nic || !user.contactNumber;
        console.log(`✅ Response ready. Profile incomplete: ${profileIncomplete}`);
        return res.status(200).send({
            accessToken,
            refreshToken,
            profileIncomplete
        });
    }
    catch (error) {
        console.error("❌ Google authentication error:", error);
        console.error("Error details:", error.message);
        return res.status(500).send({
            error: "Google authentication failed",
            details: error.message || "Unknown error"
        });
    }
});
exports.googleLogin = googleLogin;
