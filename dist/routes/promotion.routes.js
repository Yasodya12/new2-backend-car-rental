"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promotion_controller_1 = require("../controllers/promotion.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const promotionRoutes = (0, express_1.Router)();
// Admin only routes
promotionRoutes.post("/", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)('admin'), promotion_controller_1.createPromotion);
promotionRoutes.get("/", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)('admin'), promotion_controller_1.getAllPromotions);
promotionRoutes.delete("/:id", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)('admin'), promotion_controller_1.deletePromotion);
promotionRoutes.patch("/:id/toggle", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)('admin'), promotion_controller_1.togglePromotionStatus);
// User routes
promotionRoutes.put("/:id", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)('admin'), promotion_controller_1.updatePromotion);
promotionRoutes.post("/validate", auth_middleware_1.authenticateToken, promotion_controller_1.validatePromotion);
exports.default = promotionRoutes;
