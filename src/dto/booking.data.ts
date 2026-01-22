import {Types} from "mongoose";

export interface BookingDTO {
    customerId?: Types.ObjectId | null;
    tripId?: Types.ObjectId | null;
    bookingDate?: Date | null;
    status?: string;
    notes?: string | null;
}
