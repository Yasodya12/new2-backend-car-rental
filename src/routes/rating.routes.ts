import { Router } from "express";
import { saveRating, getRatingsByDriverId, getRatingByTripId } from "../controllers/rating.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const ratingRoutes: Router = Router();

ratingRoutes.post("/save", authenticateToken, saveRating);
ratingRoutes.get("/driver/:driverId", authenticateToken, getRatingsByDriverId);
ratingRoutes.get("/trip/:tripId", authenticateToken, getRatingByTripId);

export default ratingRoutes;





