import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    notes: {
        type: String
    }
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
