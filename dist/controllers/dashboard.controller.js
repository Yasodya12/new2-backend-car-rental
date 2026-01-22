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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHealth = exports.getDashboardStats = void 0;
const dashboard_service_1 = require("../service/dashboard.service");
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield (0, dashboard_service_1.getDashboardData)();
        res.status(200).json(stats);
    }
    catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
});
exports.getDashboardStats = getDashboardStats;
const checkHealth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ message: "Health check successful" });
    }
    catch (err) {
        console.error("Health Error:", err);
        res.status(500).json({ message: "Health check failed" });
    }
});
exports.checkHealth = checkHealth;
