import { Types } from "mongoose";

export interface TripDTO {
    driverId?: Types.ObjectId | null;
    vehicleId?: Types.ObjectId | null;
    customerId?: Types.ObjectId | null;
    startLocation: string;
    endLocation: string;
    date: Date;
    endDate?: Date | null;
    status?: string;
    distance?: string | null;
    price?: number | null;
    notes?: string | null;
    tripType?: "Instant" | "Scheduled";
    startLat?: number | null;
    startLng?: number | null;
    endLat?: number | null;
    endLng?: number | null;
    currentLat?: number | null;
    currentLng?: number | null;
    currentProgress?: number | null;
    createdAt?: Date;
}

export interface TripStatusDTO {
    status: "Pending" | "Accepted" | "Processing" | "Completed" | "Cancelled";
}

export interface TripLocationDTO {
    currentLat: number;
    currentLng: number;
    currentProgress: number;
}

