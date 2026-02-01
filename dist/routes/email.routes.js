"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_controller_1 = require("../controllers/email.controller");
const emailRouter = express_1.default.Router();
emailRouter.post("/send-booking-confirmation", email_controller_1.sendBookingConfirmation);
emailRouter.post("/send-trip-assignment", email_controller_1.sendTripAssignment);
emailRouter.post("/send-password-reset", email_controller_1.sendPasswordReset);
emailRouter.post("/send-admin-message", email_controller_1.sendAdminNotification);
emailRouter.post("/send-login-notification", email_controller_1.sendEnhancedLoginNotification);
exports.default = emailRouter;
