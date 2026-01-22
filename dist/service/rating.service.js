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
exports.getRatingByTripId = exports.getRatingsByDriverId = exports.saveRating = void 0;
const rating_model_1 = __importDefault(require("../model/rating.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const saveRating = (ratingData) => __awaiter(void 0, void 0, void 0, function* () {
    // Save the rating
    const rating = yield rating_model_1.default.create(ratingData);
    // Update driver's average rating
    const driverRatings = yield rating_model_1.default.find({ driverId: ratingData.driverId });
    const totalRatings = driverRatings.length;
    const sumRatings = driverRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    yield user_model_1.default.findByIdAndUpdate(ratingData.driverId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: totalRatings
    });
    return rating;
});
exports.saveRating = saveRating;
const getRatingsByDriverId = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    return rating_model_1.default.find({ driverId })
        .populate("customerId", "name email")
        .populate("tripId", "startLocation endLocation date")
        .sort({ createdAt: -1 });
});
exports.getRatingsByDriverId = getRatingsByDriverId;
const getRatingByTripId = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    return rating_model_1.default.findOne({ tripId });
});
exports.getRatingByTripId = getRatingByTripId;
