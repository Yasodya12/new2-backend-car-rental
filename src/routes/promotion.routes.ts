import { Router } from "express";
import { createPromotion, validatePromotion, getAllPromotions, deletePromotion, togglePromotionStatus, updatePromotion } from "../controllers/promotion.controller";
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware";

const promotionRoutes = Router();

// Admin only routes
promotionRoutes.post("/", authenticateToken, authorizeRole('admin'), createPromotion);
promotionRoutes.get("/", authenticateToken, authorizeRole('admin'), getAllPromotions);
promotionRoutes.delete("/:id", authenticateToken, authorizeRole('admin'), deletePromotion);
promotionRoutes.patch("/:id/toggle", authenticateToken, authorizeRole('admin'), togglePromotionStatus);

// User routes
promotionRoutes.put("/:id", authenticateToken, authorizeRole('admin'), updatePromotion);
promotionRoutes.post("/validate", authenticateToken, validatePromotion);

export default promotionRoutes;
