import { Request, Response } from "express";
import { AuthRequest } from "../types/common.types";
import { getDashboardData, getCustomerDashboardData, getDriverDashboardData } from "../service/dashboard.service";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await getDashboardData();
        res.status(200).json(stats);
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
}

export const getCustomerDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const stats = await getCustomerDashboardData(userId);
        res.status(200).json(stats);
    } catch (err) {
        console.error("Customer Dashboard Error:", err);
        res.status(500).json({ message: "Failed to fetch customer dashboard" });
    }
}

export const getDriverDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const stats = await getDriverDashboardData(userId);
        res.status(200).json(stats);
    } catch (err) {
        console.error("Driver Dashboard Error:", err);
        res.status(500).json({ message: "Failed to fetch driver dashboard" });
    }
}

export const checkHealth = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: "Health check successful" });
    } catch (err) {
        console.error("Health Error:", err);
        res.status(500).json({ message: "Health check failed" });
    }
}