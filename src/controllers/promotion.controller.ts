import { Request, Response } from "express";
import Promotion from "../model/promotion.model";

export const createPromotion = async (req: Request, res: Response) => {
    try {
        const promotionData = req.body;
        const newPromotion = new Promotion(promotionData);
        await newPromotion.save();
        res.status(201).json(newPromotion);
    } catch (error: any) {
        res.status(500).json({ message: "Error creating promotion", error: error.message });
    }
};

export const validatePromotion = async (req: Request, res: Response) => {
    try {
        const { code, tripAmount } = req.body;

        const promo = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });

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
        } else {
            discount = promo.value;
        }

        // Ensure discount doesn't exceed trip amount
        if (discount > tripAmount) discount = tripAmount;

        res.status(200).json({
            code: promo.code,
            discountAmount: discount,
            newTotal: tripAmount - discount
        });

    } catch (error: any) {
        res.status(500).json({ message: "Error validating promotion", error: error.message });
    }
};

export const getAllPromotions = async (req: Request, res: Response) => {
    try {
        const promos = await Promotion.find().sort({ createdAt: -1 });
        res.status(200).json(promos);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching promotions", error: error.message });
    }
};

export const deletePromotion = async (req: Request, res: Response) => {
    try {
        await Promotion.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Error deleting promotion", error: error.message });
    }
};

export const togglePromotionStatus = async (req: Request, res: Response) => {
    try {
        const promo = await Promotion.findById(req.params.id);
        if (!promo) {
            return res.status(404).json({ message: "Promotion not found" });
        }
        promo.isActive = !promo.isActive;
        await promo.save();
        res.status(200).json(promo);
    } catch (error: any) {
        res.status(500).json({ message: "Error toggling promotion status", error: error.message });
    }
};

export const updatePromotion = async (req: Request, res: Response) => {
    try {
        const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!promo) {
            return res.status(404).json({ message: "Promotion not found" });
        }
        res.status(200).json(promo);
    } catch (error: any) {
        res.status(500).json({ message: "Error updating promotion", error: error.message });
    }
};
