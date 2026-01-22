"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const dashboardRoutes = (0, express_1.Router)();
dashboardRoutes.get("/status", (0, auth_middleware_1.authorizeRole)("admin"), dashboard_controller_1.getDashboardStats);
dashboardRoutes.get("/check", dashboard_controller_1.checkHealth);
exports.default = dashboardRoutes;
