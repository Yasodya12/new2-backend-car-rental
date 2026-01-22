import Vehicle from "../model/vehicle.model";
import { VehicleDTO } from "../dto/vehicle.data";
import { filterByDistance } from "../utils/distanceUtils";
import { getPricePerKm } from "../utils/pricingUtils";

export const saveVehicle = async (vehicle: VehicleDTO): Promise<VehicleDTO> => {
    // Automatically set pricePerKm based on category if not provided
    if (!vehicle.pricePerKm && vehicle.category) {
        vehicle.pricePerKm = getPricePerKm(vehicle.category);
    }
    return Vehicle.create(vehicle) as any;
}

export const getAllVehicles = async (): Promise<VehicleDTO[]> => {
    return Vehicle.find() as any;
}

export const getVehicleById = async (id: string): Promise<VehicleDTO | null> => {
    return Vehicle.findById(id);
}

export const deleteVehicle = async (id: string): Promise<VehicleDTO | null> => {
    return Vehicle.findByIdAndDelete(id);
}

export const updateVehicle = async (id: string, vehicle: VehicleDTO): Promise<VehicleDTO | null> => {
    return Vehicle.findByIdAndUpdate(id, vehicle, { new: true });
}

export const validateVehicle = async (vehicle: VehicleDTO): Promise<string | null> => {
    if (!vehicle.brand || !vehicle.name || !vehicle.model || !vehicle.year ||
        !vehicle.color || !vehicle.seats || !vehicle.description || !vehicle.image ||
        !vehicle.category) {
        return "Please provide all required fields";
    }
    return null;
}

export const getVehiclesNearby = async (lat: number, lng: number, radiusKm: number = 5, date?: string | Date, endDate?: string | Date): Promise<VehicleDTO[]> => {
    // Get all vehicles first (only available ones)
    const allVehicles = await Vehicle.find({ isAvailable: { $ne: false } });

    // Filter by distance using Haversine formula
    let nearbyVehicles = filterByDistance(allVehicles, lat, lng, radiusKm);

    // Filter by availability (Busy Check & Maintenance Check)
    if (nearbyVehicles.length > 0) {
        const Trip = (await import("../model/trip.model")).default;
        const vehicleIds = nearbyVehicles.map(v => v._id);

        const queryDate = date ? new Date(date) : new Date();
        const queryEndDate = endDate ? new Date(endDate) : null;

        // 1. Check for Maintenance Conflicts
        // We filter out any vehicle where the requested trip overlaps with a maintenance period
        nearbyVehicles = nearbyVehicles.filter(v => {
            if (!v.maintenance || v.maintenance.length === 0) return true;

            // Check if any maintenance period overlaps with the requested trip dates
            const hasMaintenanceConflict = v.maintenance.some(m => {
                const maintenanceStart = new Date(m.startDate);
                const maintenanceEnd = new Date(m.endDate);

                if (queryEndDate) {
                    // Extended Trip: Check for date range overlap
                    // (StartA <= EndB) and (EndA >= StartB)
                    return (queryDate <= maintenanceEnd && queryEndDate >= maintenanceStart);
                } else {
                    // Quick Ride (Instant): Check if current time falls within maintenance
                    // Just check if queryDate (now) is inside the maintenance window
                    return (queryDate >= maintenanceStart && queryDate <= maintenanceEnd);
                }
            });

            return !hasMaintenanceConflict; // Keep vehicle if NO conflict
        });

        // Re-calculate vehicle IDs after maintenance filtering
        const availableVehicleIdsAfterMaintenance = nearbyVehicles.map(v => v._id);

        if (availableVehicleIdsAfterMaintenance.length === 0) {
            return [];
        }


        // 2. Check for Trip Conflicts (Existing Logic)
        const conflictQuery: any = {
            vehicleId: { $in: availableVehicleIdsAfterMaintenance },
            status: { $nin: ["Completed", "Cancelled", "Rejected"] }
        };

        if (queryEndDate) {
            // Extended Trip Search: Check for overlap
            const conflictConditions: any[] = [
                {
                    // Existing trip overlaps with requested window
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
            // Quick Ride Search (Now)
            conflictQuery.$or = [
                { status: "Processing" },
                {
                    date: { $lte: queryDate },
                    endDate: { $gte: queryDate }
                }
            ];
        }

        const busyTrips = await Trip.find(conflictQuery).select("vehicleId");
        const busyVehicleIds = new Set(busyTrips.map(t => t.vehicleId?.toString()));

        nearbyVehicles = nearbyVehicles.filter(v => !busyVehicleIds.has(v._id?.toString()));
    }

    return nearbyVehicles as any;
}
