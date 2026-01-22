// Vehicle category pricing configuration
export enum VehicleCategory {
    Economy = 'Economy',
    Standard = 'Standard',
    Luxury = 'Luxury',
    Premium = 'Premium'
}

// Price per kilometer based on vehicle category
export const CATEGORY_PRICING: Record<VehicleCategory, number> = {
    [VehicleCategory.Economy]: 50,      // Rs. 50 per km
    [VehicleCategory.Standard]: 80,     // Rs. 80 per km
    [VehicleCategory.Luxury]: 150,      // Rs. 150 per km
    [VehicleCategory.Premium]: 250      // Rs. 250 per km
};

/**
 * Get price per kilometer for a vehicle category
 * @param category - The vehicle category
 * @returns Price per kilometer
 */
export const getPricePerKm = (category: string): number => {
    return CATEGORY_PRICING[category as VehicleCategory] || CATEGORY_PRICING[VehicleCategory.Standard];
};

/**
 * Calculate trip price based on distance and vehicle category
 * @param distanceKm - Distance in kilometers
 * @param category - Vehicle category
 * @returns Total price
 */
export const calculateTripPrice = (distanceKm: number, category: string): number => {
    const pricePerKm = getPricePerKm(category);
    return Math.round(distanceKm * pricePerKm);
};
