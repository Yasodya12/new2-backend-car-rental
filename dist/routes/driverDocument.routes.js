"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const driverDocument_controller_1 = require("../controllers/driverDocument.controller");
const router = express_1.default.Router();
// Driver routes
router.post("/", auth_middleware_1.authenticateToken, driverDocument_controller_1.uploadDocument);
router.get("/driver/:driverId", auth_middleware_1.authenticateToken, driverDocument_controller_1.getDriverDocuments);
// Admin routes
router.get("/pending", auth_middleware_1.authenticateToken, driverDocument_controller_1.getPendingDocuments);
router.put("/:id/verify", auth_middleware_1.authenticateToken, driverDocument_controller_1.verifyDocument);
exports.default = router;
