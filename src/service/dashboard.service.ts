import Trip from "../model/trip.model"
import Booking from "../model/booking.model";
import User from "../model/user.model";
import Vehicle from "../model/vehicle.model";
import mongoose from "mongoose";

export const getDashboardData = async () => {
    const totalTrips = await Trip.countDocuments();
    const completedTrips = await Trip.countDocuments({ status: "Completed" });
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: "driver" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Revenue Calculation
    const revenueAgg = await Trip.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Promo Discounts
    const promoAgg = await Trip.aggregate([
        { $group: { _id: null, totalDiscount: { $sum: "$discountAmount" } } }
    ]);
    const totalPromoDiscount = promoAgg[0]?.totalDiscount || 0;

    // Top Drivers (by average rating)
    const topDrivers = await User.find({ role: "driver", totalRatings: { $gt: 0 } })
        .sort({ averageRating: -1 })
        .limit(5)
        .select('name averageRating totalRatings profileImage');

    // Trip Distribution
    const tripDistribution = await Trip.aggregate([
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
};

export const getCustomerDashboardData = async (userId: string) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all trips for this customer
    const trips = await Trip.find({ customerId: userId }).populate('driverId vehicleId').sort({ createdAt: -1 });

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

    // Calculate yearly spending (last 12 months)
    const yearlySpending = await Trip.aggregate([
        { $match: { customerId: userObjectId, status: 'Completed' } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                spending: { $sum: "$price" }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: 12 }
    ]);

    // Calculate monthly spending (Daily breakdown for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlySpending = await Trip.aggregate([
        {
            $match: {
                customerId: userObjectId,
                status: 'Completed',
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                spending: { $sum: "$price" }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    // Calculate daily spending (Hourly breakdown for today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const hourlySpending = await Trip.aggregate([
        {
            $match: {
                customerId: userObjectId,
                status: 'Completed',
                createdAt: { $gte: startOfToday }
            }
        },
        {
            $group: {
                _id: { $hour: "$createdAt" },
                spending: { $sum: "$price" }
            }
        },
        { $sort: { _id: 1 } } // Sort by hour ascending (0-23)
    ]);

    // Calculate weekly spending (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklySpending = await Trip.aggregate([
        {
            $match: {
                customerId: userObjectId,
                status: 'Completed',
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                spending: { $sum: "$price" }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    // Get favorite destinations (top 3 end locations)
    const favoriteDestinations = await Trip.aggregate([
        { $match: { customerId: userObjectId, status: 'Completed' } },
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
        yearlySpending,
        monthlySpending,
        weeklySpending,
        hourlySpending,
        favoriteDestinations: favoriteDestinations.map(d => ({ location: d._id, count: d.count }))
    };
};

export const getDriverDashboardData = async (userId: string) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all trips for this driver
    const trips = await Trip.find({ driverId: userObjectId }).populate('customerId vehicleId').sort({ createdAt: -1 });
    const user = await User.findById(userObjectId);
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'Cancelled').length;

    // Calculate total earnings
    const totalEarnings = trips
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + (t.price || 0), 0);

    // Calculate average rating
    // const tripsWithRatings = trips.filter(t => t.rating && t.rating > 0);
    // const avgRating = tripsWithRatings.length > 0
    //     ? tripsWithRatings.reduce((sum, t) => sum + (t.rating || 0), 0) / tripsWithRatings.length
    //     : 0;
    const avgRating = user?.averageRating ?? 0;

    // Get recent trips (last 5)
    const recentTrips = trips.slice(0, 5);

    // Calculate monthly earnings (last 6 months)
    const monthlyEarnings = await Trip.aggregate([
        { $match: { driverId: userObjectId, status: 'Completed' } },
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
    const frequentRoutes = await Trip.aggregate([
        { $match: { driverId: userObjectId, status: 'Completed' } },
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
        avgRating: avgRating,
        completionRate: Math.round(completionRate * 10) / 10,
        recentTrips,
        monthlyEarnings,
        frequentRoutes: frequentRoutes.map(r => ({
            route: `${r._id.start} → ${r._id.end}`,
            count: r.count
        }))
    };
};
