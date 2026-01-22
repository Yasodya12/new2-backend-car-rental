import * as tripService from "../service/trip.services";
import { Request, Response } from "express";
import { updateTripStatus as updateTripStatusService } from "../service/trip.services";
import { TripStatusDTO, TripLocationDTO } from "../dto/trip.data";

import Payment from "../model/payment.model";
import Promotion from "../model/promotion.model";
import { createNotification } from "../service/notification.service";

export const updateTripStatus = async (
    req: Request<{ id: string }, {}, TripStatusDTO>,
    res: Response
) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).send({ error: "Status is required" });
        }

        const updatedTrip: any = await updateTripStatusService(id, { status });
        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }

        // Helper to get ID string whether populated or not
        const customerIdStr = updatedTrip.customerId && updatedTrip.customerId._id
            ? updatedTrip.customerId._id.toString()
            : (updatedTrip.customerId ? updatedTrip.customerId.toString() : null);

        const driverIdStr = updatedTrip.driverId && updatedTrip.driverId._id
            ? updatedTrip.driverId._id.toString()
            : (updatedTrip.driverId ? updatedTrip.driverId.toString() : null);

        // Auto-generate Invoice if Trip is Completed
        if (status === "Completed") {
            const existingPayment = await Payment.findOne({ tripId: id });
            if (!existingPayment && updatedTrip.price && updatedTrip.userId) {
                await Payment.create({
                    tripId: id,
                    userId: updatedTrip.userId, // Assuming trip has reference to the customer
                    amount: updatedTrip.price,
                    status: 'Pending',
                    method: 'Cash'
                });
                console.log(`Auto-generated invoice for Trip ${id}`);

                // Notify customer about invoice generation
                if (customerIdStr) {
                    await createNotification(
                        customerIdStr,
                        "Invoice Generated",
                        `Your trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has been completed. Invoice amount: Rs. ${updatedTrip.price}`,
                        "Info",
                        `/trips/${id}`
                    );
                }

                // Notify driver about payment
                if (driverIdStr) {
                    await createNotification(
                        driverIdStr,
                        "Trip Completed",
                        `Trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} completed. Payment: Rs. ${updatedTrip.price}`,
                        "Success",
                        `/trips/${id}`
                    );
                }
            }
        }

        // Notify on status changes
        if (status === "Accepted" && customerIdStr) {
            await createNotification(
                customerIdStr,
                "Trip Accepted",
                `Your trip has been accepted and confirmed!`,
                "Success",
                `/trips/${id}`
            );
        }

        if (status === "Processing" && customerIdStr) {
            await createNotification(
                customerIdStr,
                "Trip Started",
                `Your trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has started!`,
                "Info",
                `/trips/${id}`
            );
        }

        if (status === "Cancelled") {
            // Notify customer
            if (customerIdStr) {
                await createNotification(
                    customerIdStr,
                    "Trip Cancelled",
                    `Your trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has been cancelled.`,
                    "Warning",
                    `/trips?rebook=${id}`
                );
            }
            // Notify driver
            if (driverIdStr) {
                await createNotification(
                    driverIdStr,
                    "Trip Cancelled",
                    `Trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has been cancelled.`,
                    "Warning",
                    `/trips?rebook=${id}`
                );
            }
        }

        return res.status(200).send(updatedTrip);
    } catch (error) {
        return res.status(500).send(error);
    }
};

export const getAllTrips = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let filter = {};

        if (user && user.role === "driver") {
            filter = { driverId: user.id };
        } else if (user && user.role === "customer") {
            filter = { customerId: user.id };
        }
        // Admins see all trips (empty filter)

        const trips = await tripService.getAllTrips(filter);
        return res.status(200).send(trips);
    } catch (error: any) {
        return res.status(500).send({ error: error.message });
    }
}

export const getTripById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const trip = await tripService.getTripById(id);
        if (!trip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(trip);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const saveTrip = async (req: Request, res: Response) => {
    try {
        const trip = req.body;
        const validationError = await tripService.validateTrip(trip);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedTrip = await tripService.saveTrip(trip);

        // If promo code was used, increment usedCount and re-validate for safety
        if (trip.promoCode) {
            const promo = await Promotion.findOne({ code: trip.promoCode.toUpperCase(), isActive: true });
            if (promo) {
                // Verify discount is not manipulated (basic check)
                let expectedDiscount = 0;
                const tripAmount = trip.price + trip.discountAmount; // Original price

                if (promo.discountType === 'Percentage') {
                    expectedDiscount = (tripAmount * promo.value) / 100;
                    if (promo.maxDiscount > 0 && expectedDiscount > promo.maxDiscount) {
                        expectedDiscount = promo.maxDiscount;
                    }
                } else {
                    expectedDiscount = promo.value;
                }

                if (Math.abs(expectedDiscount - trip.discountAmount) > 1) {
                    console.warn(`Potential price manipulation detected for promo ${trip.promoCode}. Expected ${expectedDiscount}, got ${trip.discountAmount}`);
                    // Force the correct discount for safety
                    trip.discountAmount = expectedDiscount;
                    trip.price = tripAmount - expectedDiscount;
                }

                await Promotion.findOneAndUpdate(
                    { code: trip.promoCode.toUpperCase() },
                    { $inc: { usedCount: 1 } }
                );
            }
        }

        // Notify customer about trip creation
        if (trip.customerId) {
            await createNotification(
                trip.customerId,
                "Trip Created",
                `Your trip from ${trip.startLocation} to ${trip.endLocation} has been created successfully.`,
                "Success",
                `/trips/${(savedTrip as any)._id}`
            );
        }

        // Notify driver about trip assignment
        if (trip.driverId) {
            await createNotification(
                trip.driverId,
                "New Trip Assigned",
                `You have been assigned a trip from ${trip.startLocation} to ${trip.endLocation}.`,
                "Info",
                `/trips/${(savedTrip as any)._id}`
            );
        }

        return res.status(201).send(savedTrip);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const updateTrip = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const trip = req.body;
        const validationError = await tripService.validateTrip(trip);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedTrip = await tripService.updateTrip(id, trip);
        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(updatedTrip);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const deleteTrip = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const deletedTrip = await tripService.deleteTrip(id);
        if (!deletedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(deletedTrip);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const getTripsByDriverId = async (req: Request, res: Response) => {
    try {
        const driverId = req.params.driverId;
        console.log("Controller get trips by driverId", driverId);
        const trips = await tripService.getTripsByDriverId(driverId);
        return res.status(200).send(trips);
    } catch (error) {
        return res.status(500).send(error);
    }
};

export const updateTripLocation = async (
    req: Request<{ id: string }, {}, TripLocationDTO>,
    res: Response
) => {
    try {
        const id = req.params.id;
        const { currentLat, currentLng, currentProgress } = req.body;

        const updatedTrip = await tripService.updateTripLocation(id, {
            currentLat,
            currentLng,
            currentProgress
        });

        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }

        return res.status(200).send(updatedTrip);
    } catch (error) {
        return res.status(500).send(error);
    }
};

export const rejectTrip = async (req: Request, res: Response) => {
    try {
        const tripId = req.params.id;
        const driverId = (req as any).user.id;
        const { reason } = req.body;

        const trip: any = await tripService.getTripById(tripId);
        if (!trip) {
            return res.status(404).send({ error: "Trip not found" });
        }

        // Verify the driver is assigned to this trip
        const assignedDriverId = trip.driverId?._id?.toString() || trip.driverId?.toString();
        if (assignedDriverId !== driverId) {
            return res.status(403).send({ error: "You are not assigned to this trip" });
        }

        // Update trip status to Rejected
        trip.status = "Rejected";
        trip.rejectionReason = reason || "No reason provided";

        // Add driver to rejectedDrivers array if not already there
        if (!trip.rejectedDrivers) {
            trip.rejectedDrivers = [];
        }
        if (!trip.rejectedDrivers.includes(driverId)) {
            trip.rejectedDrivers.push(driverId);
        }

        await trip.save();

        // Notify customer about rejection
        const customerIdStr = trip.customerId?._id?.toString() || trip.customerId?.toString();
        if (customerIdStr) {
            await createNotification(
                customerIdStr,
                "Trip Rejected by Driver",
                `Your trip from ${trip.startLocation} to ${trip.endLocation} was rejected. Click to select a new driver or cancel.`,
                "Warning",
                `/trips?reassign=${tripId}`
            );
        }

        return res.status(200).send({ message: "Trip rejected successfully", trip });
    } catch (error: any) {
        return res.status(500).send({ error: error.message });
    }
};

export const reassignTrip = async (req: Request, res: Response) => {
    try {
        const tripId = req.params.id;
        const { newDriverId } = req.body;
        const userId = (req as any).user.id;

        if (!newDriverId) {
            return res.status(400).send({ error: "New driver ID is required" });
        }

        const trip: any = await tripService.getTripById(tripId);
        if (!trip) {
            return res.status(404).send({ error: "Trip not found" });
        }

        // Verify the user is the customer or admin
        const customerIdStr = trip.customerId?._id?.toString() || trip.customerId?.toString();
        const userRole = (req as any).user.role;
        if (customerIdStr !== userId && userRole !== 'admin') {
            return res.status(403).send({ error: "Not authorized to reassign this trip" });
        }

        // Check if new driver hasn't already rejected this trip
        if (trip.rejectedDrivers && trip.rejectedDrivers.includes(newDriverId)) {
            return res.status(400).send({ error: "This driver has already rejected this trip" });
        }

        // Reassign trip to new driver
        trip.driverId = newDriverId;
        trip.status = "Pending";
        trip.rejectionReason = undefined;

        await trip.save();

        // Notify new driver
        await createNotification(
            newDriverId,
            "New Trip Assigned",
            `You have been assigned a trip from ${trip.startLocation} to ${trip.endLocation}.`,
            "Info",
            `/trips/${tripId}`
        );

        // Notify customer
        if (customerIdStr) {
            await createNotification(
                customerIdStr,
                "Trip Reassigned",
                `Your trip has been reassigned to a new driver.`,
                "Success",
                `/trips/${tripId}`
            );
        }

        return res.status(200).send({ message: "Trip reassigned successfully", trip });
    } catch (error: any) {
        return res.status(500).send({ error: error.message });
    }
};
