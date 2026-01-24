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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAdmin = exports.approveDriver = exports.toggleAvailability = exports.getDriversNearby = exports.getUserByEmail = exports.getDriverApprovals = exports.getAllUsersByRole = exports.getAllUser = exports.getUserById = exports.deleteUser = exports.updateUser = exports.saveUser = void 0;
const user_model_1 = __importDefault(require("../model/user.model"));
const userService = __importStar(require("../service/user.service"));
const email_1 = require("../utils/email");
const email_templates_1 = require("../utils/email.templates");
const notification_service_1 = require("../service/notification.service");
const saveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const validationError = yield userService.validateUser(userData, false);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedUser = yield userService.registerUser(userData);
        // Notify admins about new driver registration
        if (userData.role === "driver") {
            const admins = yield user_model_1.default.find({ role: "admin" });
            for (const admin of admins) {
                yield (0, notification_service_1.createNotification)(admin._id.toString(), "New Driver Registration", `A new driver ${userData.name} has registered and is pending approval.`, "Info", `/driver`);
            }
        }
        return res.status(201).send(savedUser);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.saveUser = saveUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = req.body;
        const validationError = yield userService.validateUser(user, true);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedUser = yield userService.updateUser(id, user);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(updatedUser);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedUser = yield userService.deleteUser(id);
        if (!deletedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(deletedUser);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.deleteUser = deleteUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield userService.getUserById(id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(user);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.getUserById = getUserById;
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userService.getAllUser();
        return res.status(200).send(users);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.getAllUser = getAllUser;
const getAllUsersByRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const role = req.params.role;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        // Security: Only admins can view roles other than 'driver'
        if (role !== 'driver' && userRole !== 'admin') {
            return res.status(403).send({ error: "Access denied. Only admins can view this role list." });
        }
        // Security: Only admins can include unapproved users
        const includeUnapproved = req.query.includeUnapproved === 'true' && userRole === 'admin';
        const filter = req.query.filter;
        const search = req.query.search;
        const users = yield userService.getAllUsersByRole(role, includeUnapproved, filter, search);
        return res.status(200).send(users);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.getAllUsersByRole = getAllUsersByRole;
const getDriverApprovals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const approvals = yield userService.getDriverApprovals();
        return res.status(200).send(approvals);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Failed to fetch driver approvals" });
    }
});
exports.getDriverApprovals = getDriverApprovals;
const getUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.params.email;
        const user = yield userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(user);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.getUserByEmail = getUserByEmail;
const getDriversNearby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lat = req.query.lat ? parseFloat(req.query.lat) : NaN;
        const lng = req.query.lng ? parseFloat(req.query.lng) : NaN;
        const radius = parseFloat(req.query.radius) || 5;
        const date = req.query.date;
        const endDate = req.query.endDate;
        // If coordinates are provided, perform distance-based search
        // Otherwise, return all available/non-busy drivers
        const drivers = yield userService.getDriversNearby(lat, lng, radius, date, endDate);
        return res.status(200).send(drivers);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.getDriversNearby = getDriversNearby;
const toggleAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield userService.getUserById(id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        const updatedUser = yield userService.toggleAvailability(id);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(updatedUser);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.toggleAvailability = toggleAvailability;
const approveDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield userService.getUserById(id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        if (user.role !== "driver") {
            return res.status(400).send({ error: "Only drivers can be approved" });
        }
        const updatedUser = yield userService.approveDriver(id);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        // Notify driver about approval
        yield (0, notification_service_1.createNotification)(id, "Account Approved", "Congratulations! Your driver account has been approved. You can now start accepting trips.", "Success", `/user`);
        return res.status(200).send(updatedUser);
    }
    catch (error) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
});
exports.approveDriver = approveDriver;
const saveAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).send({ error: "Name and Email are required" });
        }
        // Check if user already exists
        const existingUser = yield userService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).send({ error: "User with this email already exists" });
        }
        // Generate a secure random password (excluding ambiguous characters)
        const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
        let generatedPassword = "";
        for (let i = 0; i < 12; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const userData = {
            name,
            email,
            password: generatedPassword,
            role: "admin"
        };
        const savedUser = yield userService.registerUser(userData);
        // Send credentials via email
        try {
            const html = (0, email_templates_1.adminCredentialsTemplate)(name, email, generatedPassword);
            yield (0, email_1.sendEmail)(email, "Your Admin Account Credentials 🏛️", `Welcome! Your temporary password is: ${generatedPassword}`, html);
        }
        catch (emailError) {
            console.error("Failed to send admin credentials email:", emailError);
        }
        return res.status(201).send(savedUser);
    }
    catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).send({ error: "Failed to create administrator" });
    }
});
exports.saveAdmin = saveAdmin;
