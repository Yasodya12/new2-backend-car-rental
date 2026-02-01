"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticateToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Authentication token is missing in the header" });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Authentication token is invalid" });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: "Access denied for this role" });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
