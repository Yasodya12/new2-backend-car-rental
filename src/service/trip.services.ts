import Trip from "../model/trip.model";
import Vehicle from "../model/vehicle.model";
import { TripDTO, TripStatusDTO } from "../dto/trip.data";
import { PopulatedTripDTO } from "../dto/populate.trip.data";
import { sendEmail } from "../utils/email";
import { tripAcceptedTemplate, tripCancelledTemplate, tripCompletedTemplate } from "../utils/email.templates";
import { calculateTripPrice } from "../utils/pricingUtils";

export const getTripsByDriverId = async (driverId: string): Promise<PopulatedTripDTO[]> => {
    console.log("driverId", driverId);
    const trips = await Trip.find({ driverId })
        .populate("driverId", "_id name email averageRating totalRatings experience provincesVisited")
        .populate("vehicleId", "_id brand model name category pricePerKm")
        .populate("customerId", "_id name email")
        .lean();

    return trips as unknown as PopulatedTripDTO[]
}

export const getAllTrips = async (filter: any = {}): Promise<PopulatedTripDTO[]> => {
    const trips = await Trip.find(filter)
        .populate("driverId", "_id name email averageRating totalRatings experience provincesVisited")
        .populate("vehicleId", "_id brand model name category pricePerKm")
        .populate("customerId", "_id name email")
        .lean();

    return trips as unknown as PopulatedTripDTO[]
}

export const saveTrip = async (trip: TripDTO): Promise<TripDTO> => {
    // Auto-calculate price based on vehicle category and distance
    if (trip.vehicleId && trip.distance && !trip.price) {
        // Extract numeric distance (handle "50 km" or "50")
        const distanceStr = trip.distance.toString().replace(/[^\d.]/g, '');
        const distanceKm = parseFloat(distanceStr);

        if (!isNaN(distanceKm) && distanceKm > 0) {
            // Fetch vehicle to get category
            const vehicle = await Vehicle.findById(trip.vehicleId);
            if (vehicle && vehicle.category) {
                trip.price = calculateTripPrice(distanceKm, vehicle.category);
            }
        }
    }

    return Trip.create(trip);
}

export const getTripById = async (id: string): Promise<TripDTO | null> => {
    return Trip.findById(id);
}

export const deleteTrip = async (id: string): Promise<TripDTO | null> => {
    return Trip.findByIdAndDelete(id);
}

export const updateTrip = async (id: string, trip: TripDTO): Promise<TripDTO | null> => {
    return Trip.findByIdAndUpdate(id, trip, { new: true });
}
export const validateTrip = async (trip: TripDTO): Promise<string | null> => {
    if (!trip.driverId || !trip.vehicleId || !trip.startLocation || !trip.endLocation || !trip.date) {
        return "Please provide all required fields";
    }

    // Validate endDate if provided
    if (trip.endDate) {
        const startDate = new Date(trip.date);
        const endDate = new Date(trip.endDate);

        if (endDate < startDate) {
            return "End date cannot be before start date";
        }
    }

    // Check for Driver Availability Conflict
    const driverId = trip.driverId;
    const queryDate = new Date(trip.date);
    const queryEndDate = trip.endDate ? new Date(trip.endDate) : null;

    // Find conflicting trips
    const conflictQuery: any = {
        driverId: driverId,
        status: { $nin: ["Completed", "Cancelled", "Rejected", "Pending"] }
    };

    if (queryEndDate) {
        // Extended Trip requesting...
        const conflictConditions: any[] = [
            {
                // Existing Extended Trips that overlap (Accepted or Processing)
                date: { $lt: queryEndDate },
                endDate: { $gt: queryDate }
            }
        ];

        // Only check for active instant trips if the requested trip starts SOON (within 2 hours)
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (queryDate < twoHoursFromNow) {
            conflictConditions.push({
                endDate: { $exists: false },
                status: "Processing"
            });
        }

        conflictQuery.$or = conflictConditions;
    } else {
        // Quick Ride requesting...
        const conflictConditions: any[] = [
            // Active Quick Rides block immediately
            {
                status: "Processing",
                endDate: { $exists: false }
            }
        ];

        // Accepted or Processing Extended Trips that cover the Quick Ride time
        const now = new Date();
        conflictConditions.push({
            date: { $lte: now },
            endDate: { $gte: now },
            status: { $in: ["Accepted", "Processing"] }
        });

        conflictQuery.$or = conflictConditions;
    }

    const conflictingTrip = await Trip.findOne(conflictQuery);

    if (conflictingTrip) {
        return "Driver is already busy with another trip during this time.";
    }

    // Check for Vehicle Availability Conflict
    const vehicleId = trip.vehicleId;
    const vehicleConflictQuery: any = {
        vehicleId: vehicleId,
        status: { $nin: ["Completed", "Cancelled", "Rejected", "Pending"] }
    };

    if (queryEndDate) {
        // Extended Trip requesting...
        const conflictConditions: any[] = [
            { date: { $lt: queryEndDate }, endDate: { $gt: queryDate } }
        ];
        // 2-hour buffer rule
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (queryDate < twoHoursFromNow) {
            conflictConditions.push({ endDate: { $exists: false }, status: "Processing" });
        }
        vehicleConflictQuery.$or = conflictConditions;
    } else {
        // Quick Ride
        const conflictConditions: any[] = [
            // Active Quick Rides block immediately
            {
                status: "Processing",
                endDate: { $exists: false }
            }
        ];

        // Accepted or Processing Extended Trips that cover the Quick Ride time
        const now = new Date();
        conflictConditions.push({
            date: { $lte: now },
            endDate: { $gte: now },
            status: { $in: ["Accepted", "Processing"] }
        });

        vehicleConflictQuery.$or = conflictConditions;
    }

    const conflictingVehicleTrip = await Trip.findOne(vehicleConflictQuery);
    if (conflictingVehicleTrip) {
        return "Vehicle is already in use during this time.";
    }

    return null;
}

export const updateTripStatus = async (id: string, data: TripStatusDTO) => {
    const updatedTrip = await Trip.findByIdAndUpdate(id, { status: data.status }, { new: true })
        .populate("driverId")
        .populate("customerId")
        .populate("vehicleId")
        .lean();

    if (updatedTrip && updatedTrip.customerId) {
        const customer = updatedTrip.customerId as any;
        const customerEmail = customer.email;
        const customerName = customer.name;


        // Handle Trip Accepted (for Extended Trips or confirmed bookings)
        if (data.status === "Accepted" && updatedTrip.driverId) {
            const driver = updatedTrip.driverId as any;
            const vehicle = updatedTrip.vehicleId as any;

            if (driver && vehicle) {
                const html = tripAcceptedTemplate(
                    customerName,
                    updatedTrip._id.toString(),
                    driver.name,
                    vehicle.brand,
                    vehicle.model,
                    vehicle.number || "Unknown",
                    updatedTrip.startLocation,
                    updatedTrip.endLocation,
                    updatedTrip.date.toString(),
                    updatedTrip.price || 0
                );
                await sendEmail(customerEmail, "Trip Request Accepted! 🚗", "", html);
            }
        }

        // Handle Trip Processing (for active trips)
        if (data.status === "Processing" && updatedTrip.driverId) {
            const driver = updatedTrip.driverId as any;
            const vehicle = updatedTrip.vehicleId as any;

            if (driver && vehicle) {
                const html = tripAcceptedTemplate(
                    customerName,
                    updatedTrip._id.toString(),
                    driver.name,
                    vehicle.brand,
                    vehicle.model,
                    vehicle.number || "Unknown",
                    updatedTrip.startLocation,
                    updatedTrip.endLocation,
                    updatedTrip.date.toString(),
                    updatedTrip.price || 0
                );
                await sendEmail(customerEmail, "Trip Request Accepted! 🚗", "", html);
            }
        }

        // Handle Trip Cancelled
        if (data.status === "Cancelled") {
            const html = tripCancelledTemplate(
                customerName,
                updatedTrip._id.toString(),
                updatedTrip.startLocation,
                updatedTrip.endLocation,
                updatedTrip.date.toString()
            );
            await sendEmail(customerEmail, "Trip Cancelled ❌", "", html);
        }

        // Handle Trip Completed
        if (data.status === "Completed") {
            const price = updatedTrip.price || 0;
            const html = tripCompletedTemplate(
                customerName,
                updatedTrip._id.toString(),
                price,
                updatedTrip.startLocation,
                updatedTrip.endLocation,
                updatedTrip.date.toString(),
                updatedTrip.distance?.toString()
            );
            await sendEmail(customerEmail, "Your Trip Bill 📄", "", html);
        }
    }

    // If trip is completed, update driver experience
    if (data.status === "Completed" && updatedTrip) {
        const User = (await import("../model/user.model")).default;
        const driver = updatedTrip.driverId as any;

        if (driver && driver._id) {
            // Extract province from location (format: "District, Province")
            const startProvince = updatedTrip.startLocation.split(", ")[1] || "";
            const endProvince = updatedTrip.endLocation.split(", ")[1] || "";

            const driverDoc = await User.findById(driver._id);
            if (driverDoc) {
                const currentProvinces = driverDoc.provincesVisited || [];

                // Use a Set to ensure we only count a province once per trip
                const provincesToUpdate = new Set<string>();
                if (startProvince) provincesToUpdate.add(startProvince);
                if (endProvince) provincesToUpdate.add(endProvince);

                provincesToUpdate.forEach(pName => {
                    const existing = currentProvinces.find((p: any) => p.province === pName);
                    if (existing) {
                        existing.count += 1;
                    } else {
                        currentProvinces.push({ province: pName, count: 1 });
                    }
                });

                await User.findByIdAndUpdate(driver._id, {
                    $inc: { experience: 1 },
                    $set: { provincesVisited: currentProvinces }
                });
            }
        }
    }

    return updatedTrip;
};

export const updateTripLocation = async (id: string, data: { currentLat: number, currentLng: number, currentProgress: number }) => {
    return Trip.findByIdAndUpdate(id, {
        currentLat: data.currentLat,
        currentLng: data.currentLng,
        currentProgress: data.currentProgress
    }, { new: true }).lean();
};