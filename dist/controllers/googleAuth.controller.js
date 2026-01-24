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
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).send({ error: "Google credential is required" });
    }
    try {
        // Verify the Google token
        const ticket = yield client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).send({ error: "Invalid Google token" });
        }
        const { sub: googleId, email, name, picture } = payload;
        if (!email) {
            return res.status(400).send({ error: "Email not provided by Google" });
        }
        // Check if user exists by googleId or email
        let user = yield user_model_1.default.findOne({
            $or: [{ googleId }, { email }]
        });
        if (user) {
            // User exists - update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                yield user.save();
            }
        }
        else {
            // New user - create account
            user = yield user_model_1.default.create({
                googleId,
                email,
                name: name || email.split('@')[0],
                profileImage: picture,
                role: 'customer', // Default role for Google sign-up
                isApproved: true, // Auto-approve customers
            });
        }
        // Generate JWT tokens
        const accessToken = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage
        }, JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage
        }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        return res.status(200).send({
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error("Google authentication error:", error);
        return res.status(500).send({ error: "Google authentication failed" });
    }
});
exports.googleLogin = googleLogin;
