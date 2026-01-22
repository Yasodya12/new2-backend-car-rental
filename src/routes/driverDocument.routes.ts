import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    uploadDocument,
    verifyDocument,
    getDriverDocuments,
    getPendingDocuments
} from "../controllers/driverDocument.controller";

const router = express.Router();

// Driver routes
router.post("/", authenticateToken, uploadDocument);
router.get("/driver/:driverId", authenticateToken, getDriverDocuments);

// Admin routes
router.get("/pending", authenticateToken, getPendingDocuments);
router.put("/:id/verify", authenticateToken, verifyDocument);

export default router;
