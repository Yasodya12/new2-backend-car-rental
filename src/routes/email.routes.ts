import express, {Router} from "express";
import {
    sendAdminNotification,
    sendBookingConfirmation,
    sendEnhancedLoginNotification,
    sendPasswordReset,
    sendTripAssignment
} from "../controllers/email.controller";

const emailRouter: Router = express.Router();

emailRouter.post("/send-booking-confirmation", sendBookingConfirmation);
emailRouter.post("/send-trip-assignment", sendTripAssignment);
emailRouter.post("/send-password-reset", sendPasswordReset);
emailRouter.post("/send-admin-message", sendAdminNotification);
emailRouter.post("/send-login-notification", sendEnhancedLoginNotification);

export default emailRouter;
