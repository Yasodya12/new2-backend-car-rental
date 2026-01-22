import * as bookingService from "../service/booking.service";
import {Request, Response} from "express";
import mongoose from "mongoose";

export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await bookingService.getAllBookings();
        return res.status(200).send(bookings);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const getBookingById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const booking = await bookingService.getBookingById(id);
        if (!booking) {
            return res.status(404).send({error: "Booking not found"});
        }
        return res.status(200).send(booking);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const getBookingsByCustomerId = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.customerId;
        const bookings = await bookingService.getBookingsByCustomerId(customerId);
        return res.status(200).send(bookings);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const saveBooking = async (req: Request, res: Response) => {
    try {
        const booking = {
            ...req.body,
            customerId: new mongoose.Types.ObjectId(req.body.customerId),
            tripId: new mongoose.Types.ObjectId(req.body.tripId),
        };
        const validationError = await bookingService.validateBooking(booking);
        if (validationError) {
            return res.status(400).send({error: validationError});
        }
        const savedBooking = await bookingService.saveBooking(booking);
        return res.status(201).send(savedBooking);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const updateBooking = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const booking = req.body;
        const validationError = await bookingService.validateBooking(booking);
        if (validationError) {
            return res.status(400).send({error: validationError});
        }
        const updatedBooking = await bookingService.updateBooking(id, booking);
        if (!updatedBooking) {
            return res.status(404).send({error: "Booking not found"});
        }
        return res.status(200).send(updatedBooking);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const deleteBooking = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const deletedBooking = await bookingService.deleteBooking(id);
        if (!deletedBooking) {
            return res.status(404).send({error: "Booking not found"});
        }
        return res.status(200).send(deletedBooking);
    } catch (error) {
        return res.status(500).send(error);
    }
}

