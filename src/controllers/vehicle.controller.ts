import * as vehicleService from "../service/vehicle.service";
import e, { Request, Response } from "express";


export const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        return res.status(200).send(vehicles);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const getVehicleById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const vehicle = await vehicleService.getVehicleById(id);
        if (!vehicle) {
            return res.status(404).send({ error: "Vehicle not found" });
        }
        return res.status(200).send(vehicle);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const saveVehicle = async (req: Request, res: Response) => {
    try {
        const vehicle = req.body;
        const validationError = await vehicleService.validateVehicle(vehicle);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedVehicle = await vehicleService.saveVehicle(vehicle);
        return res.status(201).send(savedVehicle);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const vehicle = req.body;
        const validationError = await vehicleService.validateVehicle(vehicle);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedVehicle = await vehicleService.updateVehicle(id, vehicle);
        if (!updatedVehicle) {
            return res.status(404).send({ error: "Vehicle not found" });
        }
        return res.status(200).send(updatedVehicle);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const deletedVehicle = await vehicleService.deleteVehicle(id);
        if (!deletedVehicle) {
            return res.status(404).send({ error: "Vehicle not found" });
        }
        return res.status(200).send(deletedVehicle);
    } catch (error) {
        return res.status(500).send(error);
    }
}

export const getVehiclesNearby = async (req: Request, res: Response) => {
    try {
        const lat = parseFloat(req.query.lat as string);
        const lng = parseFloat(req.query.lng as string);
        const radius = parseFloat(req.query.radius as string) || 5;

        const date = req.query.date as string;
        const endDate = req.query.endDate as string;

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).send({ error: "Invalid coordinates. Please provide valid lat and lng." });
        }

        const vehicles = await vehicleService.getVehiclesNearby(lat, lng, radius, date, endDate);
        return res.status(200).send(vehicles);
    } catch (error) {
        return res.status(500).send(error);
    }
}

