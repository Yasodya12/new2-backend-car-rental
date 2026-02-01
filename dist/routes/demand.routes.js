"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const demand_controller_1 = require("../controllers/demand.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const demandRoutes = (0, express_1.Router)();
// Log a demand signal (any authenticated user)
demandRoutes.post("/", demand_controller_1.createDemandSignal);
// Get all demand signals (Admin only)
demandRoutes.get("/", (0, auth_middleware_1.authorizeRole)('admin'), demand_controller_1.getDemandSignals);
exports.default = demandRoutes;
