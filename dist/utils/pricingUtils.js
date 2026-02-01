"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTripPrice = exports.getPricePerKm = exports.CATEGORY_PRICING = exports.VehicleCategory = void 0;
// Vehicle category pricing configuration
var VehicleCategory;
(function (VehicleCategory) {
    VehicleCategory["Economy"] = "Economy";
    VehicleCategory["Standard"] = "Standard";
    VehicleCategory["Luxury"] = "Luxury";
    VehicleCategory["Premium"] = "Premium";
})(VehicleCategory || (exports.VehicleCategory = VehicleCategory = {}));
// Price per kilometer based on vehicle category
exports.CATEGORY_PRICING = {
    [VehicleCategory.Economy]: 50, // Rs. 50 per km
    [VehicleCategory.Standard]: 80, // Rs. 80 per km
    [VehicleCategory.Luxury]: 150, // Rs. 150 per km
    [VehicleCategory.Premium]: 250 // Rs. 250 per km
};
/**
 * Get price per kilometer for a vehicle category
 * @param category - The vehicle category
 * @returns Price per kilometer
 */
const getPricePerKm = (category) => {
    return exports.CATEGORY_PRICING[category] || exports.CATEGORY_PRICING[VehicleCategory.Standard];
};
exports.getPricePerKm = getPricePerKm;
/**
 * Calculate trip price based on distance and vehicle category
 * @param distanceKm - Distance in kilometers
 * @param category - Vehicle category
 * @returns Total price
 */
const calculateTripPrice = (distanceKm, category) => {
    const pricePerKm = (0, exports.getPricePerKm)(category);
    return Math.round(distanceKm * pricePerKm);
};
exports.calculateTripPrice = calculateTripPrice;
