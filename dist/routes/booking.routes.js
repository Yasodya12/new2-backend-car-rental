"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const bookingRoute = (0, express_1.Router)();
bookingRoute.use(auth_middleware_1.authenticateToken); // All routes require authentication
bookingRoute.get("/all", (0, auth_middleware_1.authorizeRole)('admin'), booking_controller_1.getAllBookings);
bookingRoute.post("/save", (0, auth_middleware_1.authorizeRole)('admin', 'customer'), booking_controller_1.saveBooking);
bookingRoute.get("/find/:id", (0, auth_middleware_1.authorizeRole)('admin', 'customer'), booking_controller_1.getBookingById);
bookingRoute.put("/update/:id", (0, auth_middleware_1.authorizeRole)('admin', 'customer'), booking_controller_1.updateBooking);
bookingRoute.delete("/delete/:id", (0, auth_middleware_1.authorizeRole)('admin', 'customer'), booking_controller_1.deleteBooking);
bookingRoute.get("/all-by-customer/:customerId", (0, auth_middleware_1.authorizeRole)('admin', 'customer'), booking_controller_1.getBookingsByCustomerId);
exports.default = bookingRoute;
