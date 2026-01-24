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
exports.getDriverDashboardData = exports.getCustomerDashboardData = exports.getDashboardData = void 0;
const trip_model_1 = __importDefault(require("../model/trip.model"));
const booking_model_1 = __importDefault(require("../model/booking.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const vehicle_model_1 = __importDefault(require("../model/vehicle.model"));
const getDashboardData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const totalTrips = yield trip_model_1.default.countDocuments();
    const completedTrips = yield trip_model_1.default.countDocuments({ status: "Completed" });
    const totalUsers = yield user_model_1.default.countDocuments();
    const totalDrivers = yield user_model_1.default.countDocuments({ role: "driver" });
    const totalCustomers = yield user_model_1.default.countDocuments({ role: "customer" });
    const totalVehicles = yield vehicle_model_1.default.countDocuments();
    const totalBookings = yield booking_model_1.default.countDocuments();
    // Revenue Calculation
    const revenueAgg = yield trip_model_1.default.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
    ]);
    const totalRevenue = ((_a = revenueAgg[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
    // Promo Discounts
    const promoAgg = yield trip_model_1.default.aggregate([
        { $group: { _id: null, totalDiscount: { $sum: "$discountAmount" } } }
    ]);
    const totalPromoDiscount = ((_b = promoAgg[0]) === null || _b === void 0 ? void 0 : _b.totalDiscount) || 0;
    // Top Drivers (by average rating)
    const topDrivers = yield user_model_1.default.find({ role: "driver", totalRatings: { $gt: 0 } })
        .sort({ averageRating: -1 })
        .limit(5)
        .select('name averageRating totalRatings profileImage');
    // Trip Distribution
    const tripDistribution = yield trip_model_1.default.aggregate([
        { $group: { _id: "$tripType", count: { $sum: 1 } } }
    ]);
    return {
        totalTrips,
        completedTrips,
        totalBookings,
        totalUsers,
        totalDrivers,
        totalCustomers,
        totalVehicles,
        totalRevenue,
        totalPromoDiscount,
        topDrivers,
        tripDistribution: tripDistribution
            .filter(d => d._id) // Filter out null or missing tripTypes
            .map(d => ({ type: d._id, count: d.count }))
    };
});
exports.getDashboardData = getDashboardData;
const getCustomerDashboardData = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all trips for this customer
    const trips = yield trip_model_1.default.find({ customerId: userId }).populate('driverId vehicleId').sort({ createdAt: -1 });
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'Cancelled').length;
    const pendingTrips = trips.filter(t => t.status === 'Pending').length;
    // Calculate total spent
    const totalSpent = trips
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + (t.price || 0), 0);
    // Calculate average trip cost
    const avgTripCost = completedTrips > 0 ? totalSpent / completedTrips : 0;
    // Get recent trips (last 5)
    const recentTrips = trips.slice(0, 5);
    // Calculate monthly spending (last 6 months)
    const monthlySpending = yield trip_model_1.default.aggregate([
        { $match: { customerId: userId, status: 'Completed' } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                spending: { $sum: "$price" }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: 6 }
    ]);
    // Get favorite destinations (top 3 end locations)
    const favoriteDestinations = yield trip_model_1.default.aggregate([
        { $match: { customerId: userId, status: 'Completed' } },
        { $group: { _id: "$endLocation", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
    ]);
    // Calculate total savings from promos
    const totalSavings = trips.reduce((sum, t) => sum + (t.discountAmount || 0), 0);
    // Active bookings (Pending, Accepted, Processing)
    const activeBookingsCount = trips.filter(t => ["Pending", "Accepted", "Processing"].includes(t.status || "")).length;
    return {
        totalTrips,
        completedTrips,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalSavings: Math.round(totalSavings * 100) / 100,
        avgTripCost: Math.round(avgTripCost * 100) / 100,
        activeBookingsCount,
        recentTrips,
        monthlySpending,
        favoriteDestinations: favoriteDestinations.map(d => ({ location: d._id, count: d.count }))
    };
});
exports.getCustomerDashboardData = getCustomerDashboardData;
const getDriverDashboardData = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all trips for this driver
    const trips = yield trip_model_1.default.find({ driverId: userId }).populate('customerId vehicleId').sort({ createdAt: -1 });
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'Cancelled').length;
    // Calculate total earnings
    const totalEarnings = trips
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + (t.price || 0), 0);
    // Calculate average rating
    const tripsWithRatings = trips.filter(t => t.rating && t.rating > 0);
    const avgRating = tripsWithRatings.length > 0
        ? tripsWithRatings.reduce((sum, t) => sum + (t.rating || 0), 0) / tripsWithRatings.length
        : 0;
    // Get recent trips (last 5)
    const recentTrips = trips.slice(0, 5);
    // Calculate monthly earnings (last 6 months)
    const monthlyEarnings = yield trip_model_1.default.aggregate([
        { $match: { driverId: userId, status: 'Completed' } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                earnings: { $sum: "$price" }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: 6 }
    ]);
    // Calculate trip completion rate
    const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
    // Get most frequent routes (top 3)
    const frequentRoutes = yield trip_model_1.default.aggregate([
        { $match: { driverId: userId, status: 'Completed' } },
        {
            $group: {
                _id: { start: "$startLocation", end: "$endLocation" },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 3 }
    ]);
    return {
        totalTrips,
        completedTrips,
        cancelledTrips,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        avgRating: Math.round(avgRating * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        recentTrips,
        monthlyEarnings,
        frequentRoutes: frequentRoutes.map(r => ({
            route: `${r._id.start} → ${r._id.end}`,
            count: r.count
        }))
    };
});
exports.getDriverDashboardData = getDriverDashboardData;
