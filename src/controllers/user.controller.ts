import { Request, Response } from "express";
import User from "../model/user.model";
import * as userService from "../service/user.service";
import { UserDTO } from "../dto/user.data";
import { sendEmail } from "../utils/email";
import { adminCredentialsTemplate } from "../utils/email.templates";
import { createNotification } from "../service/notification.service";

export const saveUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body as UserDTO;
        const validationError = await userService.validateUser(userData);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedUser = await userService.registerUser(userData);

        // Notify admins about new driver registration
        if (userData.role === "driver") {
            const admins = await User.find({ role: "admin" });
            for (const admin of admins) {
                await createNotification(
                    admin._id.toString(),
                    "New Driver Registration",
                    `A new driver ${userData.name} has registered and is pending approval.`,
                    "Info",
                    `/driver`
                );
            }
        }

        return res.status(201).send(savedUser);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const user = req.body;
        const validationError = await userService.validateUser(user);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedUser = await userService.updateUser(id, user);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(updatedUser);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const deletedUser = await userService.deleteUser(id);
        if (!deletedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(deletedUser);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(user);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUser();
        return res.status(200).send(users);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

import { AuthRequest } from "../types/common.types";

export const getAllUsersByRole = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.params.role;
        const userRole = req.user?.role;

        // Security: Only admins can view roles other than 'driver'
        if (role !== 'driver' && userRole !== 'admin') {
            return res.status(403).send({ error: "Access denied. Only admins can view this role list." });
        }

        // Security: Only admins can include unapproved users
        const includeUnapproved = req.query.includeUnapproved === 'true' && userRole === 'admin';

        const users = await userService.getAllUsersByRole(role, includeUnapproved);
        return res.status(200).send(users);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const getUserByEmail = async (req: Request, res: Response) => {
    try {
        const email = req.params.email;
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(user);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const getDriversNearby = async (req: Request, res: Response) => {
    try {
        const lat = req.query.lat ? parseFloat(req.query.lat as string) : NaN;
        const lng = req.query.lng ? parseFloat(req.query.lng as string) : NaN;
        const radius = parseFloat(req.query.radius as string) || 5;

        const date = req.query.date as string;
        const endDate = req.query.endDate as string;

        // If coordinates are provided, perform distance-based search
        // Otherwise, return all available/non-busy drivers
        const drivers = await userService.getDriversNearby(lat, lng, radius, date, endDate);
        return res.status(200).send(drivers);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const toggleAvailability = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const updatedUser = await userService.toggleAvailability(id);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }

        return res.status(200).send(updatedUser);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const approveDriver = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        if (user.role !== "driver") {
            return res.status(400).send({ error: "Only drivers can be approved" });
        }

        const updatedUser = await userService.approveDriver(id);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }

        // Notify driver about approval
        await createNotification(
            id,
            "Account Approved",
            "Congratulations! Your driver account has been approved. You can now start accepting trips.",
            "Success",
            `/user`
        );

        return res.status(200).send(updatedUser);
    } catch (error: any) {
        return res.status(400).send({ error: error.message || "Approval failed" });
    }
}

export const saveAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).send({ error: "Name and Email are required" });
        }

        // Check if user already exists
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).send({ error: "User with this email already exists" });
        }

        // Generate a secure random password (excluding ambiguous characters)
        const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
        let generatedPassword = "";
        for (let i = 0; i < 12; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const userData: UserDTO = {
            name,
            email,
            password: generatedPassword,
            role: "admin"
        };

        const savedUser = await userService.registerUser(userData);

        // Send credentials via email
        try {
            const html = adminCredentialsTemplate(name, email, generatedPassword);
            await sendEmail(email, "Your Admin Account Credentials 🏛️", `Welcome! Your temporary password is: ${generatedPassword}`, html);
        } catch (emailError) {
            console.error("Failed to send admin credentials email:", emailError);
        }

        return res.status(201).send(savedUser);
    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).send({ error: "Failed to create administrator" });
    }
}

