import {ObjectId} from "mongoose";

export interface PopulatedTripDTO {
    _id?: ObjectId,
    driverId: {
        _id?: ObjectId,
        name: string,
        email: string
    },
    vehicleId: {
        _id?: ObjectId,
        brand: string,
        model: string,
        name: string
    },
    customerId?: {
        _id?: ObjectId,
        name: string,
        email: string
    },
    startLocation: string,
    endLocation: string,
    date: Date,
    endDate?: Date | null,
    status?: string,
    distance?: string | null,
    price?: number | null,
    notes?: string | null,
    tripType?: "Instant" | "Scheduled",
    createdAt?: Date
}