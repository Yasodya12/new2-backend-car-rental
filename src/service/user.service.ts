import { UserDTO } from "../dto/user.data";
import User from "../model/user.model";
import bcrypt from "bcryptjs";
import { filterByDistance } from "../utils/distanceUtils";
import { parseNIC } from "../utils/nicUtils";

export const registerUser = async (user: UserDTO): Promise<UserDTO> => {

    if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
    }

    // Set isApproved to false for drivers by default
    if (user.role === "driver") {
        user.isApproved = false;
    }

    // Parse NIC if provided to extract DOB and Gender
    if (user.nic) {
        const nicDetails = parseNIC(user.nic);
        if (nicDetails) {
            user.dateOfBirth = nicDetails.dob;
            user.gender = nicDetails.gender;
        }
    }

    console.log("register user function user profile image :", user.profileImage);
    const newUser = await User.create(user);

    // Create documents if provided during registration
    if (user.role === "driver") {
        if (user.licenseImage) {
            await DriverDocument.create({
                driverId: newUser._id,
                type: "License",
                documentUrl: user.licenseImage,
                status: "Pending"
            });
        }
        if (user.idImage) {
            await DriverDocument.create({
                driverId: newUser._id,
                type: "ID",
                documentUrl: user.idImage,
                status: "Pending"
            });
        }
    }

    return newUser;
}

export const getAllUser = async (): Promise<UserDTO[]> => {
    return User.find();
}

export const getUserById = async (id: string): Promise<UserDTO | null> => {
    return User.findById(id);
}

export const getUserByEmail = async (email: string): Promise<UserDTO | null> => {
    return User.findOne({ email });
}

export const updateUser = async (id: string, user: UserDTO): Promise<UserDTO | null> => {
    if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
    }

    // Parse NIC if provided to extract DOB and Gender
    if (user.nic) {
        const nicDetails = parseNIC(user.nic);
        if (nicDetails) {
            user.dateOfBirth = nicDetails.dob;
            user.gender = nicDetails.gender;
        }
    }

    return User.findByIdAndUpdate(id, user, { new: true });
};


export const deleteUser = async (id: string): Promise<UserDTO | null> => {
    return User.findByIdAndDelete(id);
}

export const getUserByRole = async (role: string): Promise<UserDTO[]> => {
    return User.find({ role });
}

export const validateUser = async (user: UserDTO, isUpdate: boolean = false): Promise<string | null> => {
    if (isUpdate) {
        if (!user.name || !user.email || !user.role || !user.nic || !user.contactNumber) {
            return "Please provide all required fields (Name, Email, Role, NIC, Contact Number)";
        }
    } else {
        if (!user.name || !user.email || !user.password || !user.role || !user.nic || !user.contactNumber) {
            return "Please provide all required fields (Name, Email, Password, Role, NIC, Contact Number)";
        }
    }
    return null;
}

export const getAllUsersByRole = async (role: string, includeUnapproved: boolean = false): Promise<UserDTO[]> => {
    // For drivers, only return approved ones unless explicitly requested
    if (role === "driver" && !includeUnapproved) {
        return User.find({ role, isApproved: true });
    }
    return User.find({ role });
}

export const getDriversNearby = async (lat: number, lng: number, radiusKm: number = 5, date?: string | Date, endDate?: string | Date): Promise<UserDTO[]> => {
    // Get all drivers first (only available and approved ones)
    const allDrivers = await User.find({ role: "driver", isAvailable: { $ne: false }, isApproved: true });

    // Filter by distance using Haversine formula (only if coordinates are valid)
    let availableDrivers = (isNaN(lat) || isNaN(lng))
        ? allDrivers
        : filterByDistance(allDrivers, lat, lng, radiusKm);

    // Filter by availability (Busy Check)
    if (availableDrivers.length > 0) {
        const Trip = (await import("../model/trip.model")).default;
        const driverIds = availableDrivers.map(d => d._id);

        const queryDate = date ? new Date(date) : new Date();
        const queryEndDate = endDate ? new Date(endDate) : null;

        // Find conflicting trips
        const conflictQuery: any = {
            driverId: { $in: driverIds },
            status: { $nin: ["Completed", "Cancelled", "Rejected"] }
        };

        if (queryEndDate) {
            // Extended Trip Search: Check for overlap
            // Conflict if: (TripStart < ReqEnd) AND (TripEnd > ReqStart)  
            const conflictConditions: any[] = [
                {
                    // Existing trip overlaps with requested window
                    date: { $lt: queryEndDate },
                    endDate: { $gt: queryDate }
                }
            ];

            // Only check for active instant trips if the requested trip starts SOON (e.g. within 2 hours)
            // If the user is booking for next month, a current "Processing" trip doesn't matter.
            const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
            if (queryDate < twoHoursFromNow) {
                conflictConditions.push({
                    endDate: { $exists: false },
                    status: "Processing"
                });
            }

            conflictQuery.$or = conflictConditions;
        } else {
            // Quick Ride Search (Now): Check if currently busy
            // Busy if: Status is Processing OR (Status is Pending/Accepted AND Time is overlapping "now")
            // Simplified: If status is Processing, they are busy.
            // If Scheduled trip covers "now", they are busy.
            conflictQuery.$or = [
                { status: "Processing" },
                {
                    date: { $lte: queryDate },
                    endDate: { $gte: queryDate }
                }
            ];
        }

        const busyTrips = await Trip.find(conflictQuery).select("driverId");
        const busyDriverIds = new Set(busyTrips.map(t => t.driverId?.toString()));

        availableDrivers = availableDrivers.filter(d => !busyDriverIds.has(d._id?.toString()));
    }

    return availableDrivers;
}

export const toggleAvailability = async (id: string): Promise<UserDTO | null> => {
    const user = await User.findById(id);
    if (!user) {
        return null;
    }

    // Toggle availability (default to true if undefined)
    const newAvailability = user.isAvailable === false ? true : false;

    return User.findByIdAndUpdate(id, { isAvailable: newAvailability }, { new: true });
}

import DriverDocument from "../model/driverDocument.model";

export const approveDriver = async (id: string): Promise<UserDTO | null> => {
    const user = await User.findById(id);
    if (!user) {
        return null;
    }

    if (user.role !== "driver") {
        throw new Error("Only drivers can be approved");
    }

    // Check if the driver has mandatory verified documents: License, ID
    const mandatoryDocs = ["License", "ID"];

    console.log(`[APPROVE_DEBUG] Attempting to find docs for driverId: "${id}"`);

    // Robust query: Try finding by string ID and ObjectId
    const mongoose = (await import("mongoose")).default;
    const searchId = new mongoose.Types.ObjectId(id);

    const allDocs = await DriverDocument.find({
        $or: [
            { driverId: id },
            { driverId: searchId as any }
        ]
    }).lean();

    console.log(`[APPROVE_DEBUG] Found ${allDocs.length} total docs in DB for driver.`);

    allDocs.forEach((d: any) => {
        console.log(`[APPROVE_DEBUG] - Type: "${d.type}", Status: "${d.status}", ID: ${d._id}`);
    });

    const verifiedDocs = allDocs.filter((d: any) => d.status === "Verified");
    const verifiedTypes = new Set(verifiedDocs.map((doc: any) => doc.type));
    const missingDocs = mandatoryDocs.filter((type) => !verifiedTypes.has(type as any));

    console.log(`[APPROVE_DEBUG] Verified count: ${verifiedDocs.length}`);
    console.log(`[APPROVE_DEBUG] Missing: ${missingDocs.join(", ") || "None"}`);

    if (missingDocs.length > 0) {
        throw new Error(
            `Driver cannot be approved. Missing or unverified mandatory documents: ${missingDocs.join(", ")}`
        );
    }

    return User.findByIdAndUpdate(id, { isApproved: true }, { new: true });
}

export const getDriverApprovals = async (): Promise<any[]> => {
    // 1. Get all drivers who are not yet approved
    const unapprovedDrivers = await User.find({ role: "driver", isApproved: false }).lean();

    // 2. Get IDs of all drivers who have pending documents
    const pendingDocs = await DriverDocument.find({ status: "Pending" }).distinct("driverId");

    // 3. Merge sets to get all drivers needing attention (unapproved OR have pending docs)
    const driverIdsSet = new Set([
        ...unapprovedDrivers.map(d => d._id.toString()),
        ...pendingDocs.map(id => id.toString())
    ]);

    const driverIds = Array.from(driverIdsSet);

    // 4. Fetch full details and all documents for these specific drivers
    const drivers = await User.find({ _id: { $in: driverIds } }).lean();

    const results = await Promise.all(drivers.map(async (driver) => {
        const docs = await DriverDocument.find({ driverId: driver._id }).lean();
        return {
            ...driver,
            documents: docs
        };
    }));

    return results;
}
