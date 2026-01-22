import { Router } from 'express';
import {
    saveTrip,
    updateTrip,
    getTripById,
    getAllTrips,
    deleteTrip,
    getTripsByDriverId,
    updateTripStatus,
    updateTripLocation,
    rejectTrip,
    reassignTrip
} from "../controllers/trip.controller";
import { authorizeRole } from '../middleware/auth.middleware';

const tripRoutes: Router = Router();

tripRoutes.get("/all", getAllTrips)
tripRoutes.get("/:id", getTripById)
tripRoutes.post("/save", saveTrip)
tripRoutes.delete("/:id", authorizeRole('admin'), deleteTrip)
tripRoutes.put("/update/:id", updateTrip)
tripRoutes.get("/get-by-driver/:driverId", getTripsByDriverId)
tripRoutes.put("/status/:id", updateTripStatus);
tripRoutes.put("/location/:id", updateTripLocation);
tripRoutes.put("/:id/reject", authorizeRole('driver'), rejectTrip);
tripRoutes.put("/:id/reassign", reassignTrip);

export default tripRoutes;