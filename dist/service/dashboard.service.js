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
exports.getDashboardData = void 0;
const trip_model_1 = __importDefault(require("../model/trip.model"));
const booking_model_1 = __importDefault(require("../model/booking.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const vehicle_model_1 = __importDefault(require("../model/vehicle.model"));
const getDashboardData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const totalTrips = yield trip_model_1.default.countDocuments();
    const completedTrips = yield trip_model_1.default.countDocuments({ status: "Completed" });
    const totalUsers = yield user_model_1.default.countDocuments();
    const totalDrivers = yield user_model_1.default.countDocuments({ role: "driver" });
    const totalCustomers = yield user_model_1.default.countDocuments({ role: "customer" });
    const totalVehicles = yield vehicle_model_1.default.countDocuments();
    const totalBookings = yield booking_model_1.default.countDocuments();
    const revenueAgg = yield trip_model_1.default.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
    ]);
    const totalRevenue = ((_a = revenueAgg[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
    return {
        totalTrips,
        completedTrips,
        totalBookings,
        totalUsers,
        totalDrivers,
        totalCustomers,
        totalVehicles,
        totalRevenue
    };
});
exports.getDashboardData = getDashboardData;
