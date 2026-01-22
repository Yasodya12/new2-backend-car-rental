import { Router } from 'express';
import { getAllVehicles, saveVehicle, getVehicleById, updateVehicle, deleteVehicle, getVehiclesNearby } from "../controllers/vehicle.controller";
import { authorizeRole } from '../middleware/auth.middleware';

const vehicleRoute: Router = Router();

vehicleRoute.get("/all", getAllVehicles)
vehicleRoute.post("/add", authorizeRole('admin'), saveVehicle)
vehicleRoute.get("/find/:id", getVehicleById)
vehicleRoute.put("/update/:id", authorizeRole('admin'), updateVehicle)
vehicleRoute.delete("/delete/:id", authorizeRole('admin'), deleteVehicle)
vehicleRoute.get("/nearby", getVehiclesNearby)

export default vehicleRoute;