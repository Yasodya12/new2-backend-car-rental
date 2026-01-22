/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Filter items by distance from a reference point
 * @param items - Array of items with location property
 * @param refLat - Reference latitude
 * @param refLng - Reference longitude
 * @param maxDistanceKm - Maximum distance in kilometers
 * @returns Filtered items within the radius
 */
export function filterByDistance<T extends { location?: { lat?: number | null; lng?: number | null } | null }>(
    items: T[],
    refLat: number,
    refLng: number,
    maxDistanceKm: number
): T[] {
    return items.filter((item) => {
        if (!item.location || item.location.lat === null || item.location.lat === undefined || item.location.lng === null || item.location.lng === undefined) {
            return false; // Exclude items without location
        }

        const distance = calculateHaversineDistance(
            refLat,
            refLng,
            item.location.lat,
            item.location.lng
        );

        return distance <= maxDistanceKm;
    });
}


