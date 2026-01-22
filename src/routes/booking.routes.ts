import { Router } from 'express';
import {
    saveBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getBookingsByCustomerId
} from "../controllers/booking.controller";


import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const bookingRoute: Router = Router();

bookingRoute.use(authenticateToken); // All routes require authentication

bookingRoute.get("/all", authorizeRole('admin'), getAllBookings)
bookingRoute.post("/save", authorizeRole('admin', 'customer'), saveBooking)
bookingRoute.get("/find/:id", authorizeRole('admin', 'customer'), getBookingById)
bookingRoute.put("/update/:id", authorizeRole('admin', 'customer'), updateBooking)
bookingRoute.delete("/delete/:id", authorizeRole('admin', 'customer'), deleteBooking)
bookingRoute.get("/all-by-customer/:customerId", authorizeRole('admin', 'customer'), getBookingsByCustomerId)

export default bookingRoute;