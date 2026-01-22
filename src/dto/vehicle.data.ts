export interface VehicleDTO {
    brand: string;
    name: string;
    model: string;
    year: string;
    color: string;
    seats: number;
    description: string;
    image: string;
    category: 'Economy' | 'Standard' | 'Luxury' | 'Premium';
    pricePerKm: number;
    location?: {
        lat?: number | null
        lng?: number | null
        address?: string | null
    } | null;
    maintenance?: {
        startDate: Date | string;
        endDate: Date | string;
        reason?: string;
    }[];
}