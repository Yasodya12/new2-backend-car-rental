import Booking from "../model/booking.model";
import {BookingDTO} from "../dto/booking.data";
import {PopulatedBookingDTO} from "../dto/populate.booking.data";

export const getAllBookings = async (): Promise<PopulatedBookingDTO[]> => {
    const bookings = await Booking.find()
        .populate("customerId", "name email")
        .populate({
            path: "tripId",
            populate: [
                { path: "driverId", select: "_id name email" },
                { path: "vehicleId", select: "_id brand model name" }
            ]
        })
        .lean();

    return bookings as unknown as PopulatedBookingDTO[];
};

export const getBookingsByCustomerId = async (customerId: string):Promise<PopulatedBookingDTO[]> => {
    const bookings = await Booking.find({customerId})
        .populate("customerId", "name email")
        .populate({
            path: "tripId",
            populate: [
                { path: "driverId", select: "_id name email" },
                { path: "vehicleId", select: "_id brand model name" }
            ]
        })
        .lean();

    return bookings as unknown as PopulatedBookingDTO[];
}


export const saveBooking = async (booking: BookingDTO):Promise<BookingDTO> => {
    return Booking.create(booking);
}

export const getBookingById = async (id: string):Promise<BookingDTO | null> => {
    return Booking.findById(id);
}

export const deleteBooking = async (id: string):Promise<BookingDTO | null> => {
    return Booking.findByIdAndDelete(id);
}

export const updateBooking = async (id: string, booking: BookingDTO):Promise<BookingDTO | null> => {
    return Booking.findByIdAndUpdate(id, booking, {new: true});
}

export const validateBooking = async (booking: BookingDTO):Promise<string | null> => {
    if ( !booking.customerId || !booking.tripId) {
        return "Please provide all required fields";
    }
    return null;
}