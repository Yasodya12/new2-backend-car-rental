"use strict";
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
exports.updatePromotion = exports.togglePromotionStatus = exports.deletePromotion = exports.getAllPromotions = exports.validatePromotion = exports.createPromotion = void 0;
const promotion_model_1 = __importDefault(require("../model/promotion.model"));
const createPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotionData = req.body;
        const newPromotion = new promotion_model_1.default(promotionData);
        yield newPromotion.save();
        res.status(201).json(newPromotion);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating promotion", error: error.message });
    }
});
exports.createPromotion = createPromotion;
const validatePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, tripAmount } = req.body;
        const promo = yield promotion_model_1.default.findOne({ code: code.toUpperCase(), isActive: true });
        if (!promo) {
            return res.status(404).json({ message: "Invalid promo code" });
        }
        // Check expiry
        if (new Date() > new Date(promo.expiryDate)) {
            return res.status(400).json({ message: "Promo code has expired" });
        }
        // Check usage limit
        if (promo.usedCount >= promo.usageLimit) {
            return res.status(400).json({ message: "Promo code usage limit reached" });
        }
        // Check minimum trip amount
        if (tripAmount < promo.minTripAmount) {
            return res.status(400).json({ message: `Minimum trip amount of LKR ${promo.minTripAmount} required for this code` });
        }
        // Calculate discount
        let discount = 0;
        if (promo.discountType === 'Percentage') {
            discount = (tripAmount * promo.value) / 100;
            if (promo.maxDiscount > 0 && discount > promo.maxDiscount) {
                discount = promo.maxDiscount;
            }
        }
        else {
            discount = promo.value;
        }
        // Ensure discount doesn't exceed trip amount
        if (discount > tripAmount)
            discount = tripAmount;
        res.status(200).json({
            code: promo.code,
            discountAmount: discount,
            newTotal: tripAmount - discount
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error validating promotion", error: error.message });
    }
});
exports.validatePromotion = validatePromotion;
const getAllPromotions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promos = yield promotion_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(promos);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching promotions", error: error.message });
    }
});
exports.getAllPromotions = getAllPromotions;
const deletePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield promotion_model_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Promotion deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting promotion", error: error.message });
    }
});
exports.deletePromotion = deletePromotion;
const togglePromotionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promo = yield promotion_model_1.default.findById(req.params.id);
        if (!promo) {
            return res.status(404).json({ message: "Promotion not found" });
        }
        promo.isActive = !promo.isActive;
        yield promo.save();
        res.status(200).json(promo);
    }
    catch (error) {
        res.status(500).json({ message: "Error toggling promotion status", error: error.message });
    }
});
exports.togglePromotionStatus = togglePromotionStatus;
const updatePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promo = yield promotion_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!promo) {
            return res.status(404).json({ message: "Promotion not found" });
        }
        res.status(200).json(promo);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating promotion", error: error.message });
    }
});
exports.updatePromotion = updatePromotion;
