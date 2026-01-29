import Rating from "../model/rating.model";
import User from "../model/user.model";
import Trip from "../model/trip.model";
import { RatingDTO } from "../dto/rating.data";

export const saveRating = async (ratingData: RatingDTO) => {
    // Save the rating
    const rating = await Rating.create(ratingData);

    // Update driver's average rating
    const driverRatings = await Rating.find({ driverId: ratingData.driverId });
    const totalRatings = driverRatings.length;
    const sumRatings = driverRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await User.findByIdAndUpdate(ratingData.driverId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: totalRatings
    });

    // Update the Trip with the rating
    await Trip.findByIdAndUpdate(ratingData.tripId, {
        rating: ratingData.rating
    });

    return rating;
};

export const getRatingsByDriverId = async (driverId: string) => {
    return Rating.find({ driverId })
        .populate("customerId", "name email")
        .populate("tripId", "startLocation endLocation date")
        .sort({ createdAt: -1 });
};

export const getRatingByTripId = async (tripId: string) => {
    return Rating.findOne({ tripId });
};





