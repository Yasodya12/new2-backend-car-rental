import { ObjectId } from "mongoose";

export interface PopulatedBookingDTO {
    _id?: ObjectId;
    customerId: {
        _id?: ObjectId;
        name: string;
        email: string;
    } | null;

    tripId: {
        driverId: {
            _id?: ObjectId;
            name: string;
            email: string;
        };
        vehicleId: {
            brand: string;
            model: string;
            name: string;
        };
        startLocation: string;
        endLocation: string;
        date: Date;
    } | null;

    bookingDate: Date;
    status: string;
    notes?: string;
}
