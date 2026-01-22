import {Request, Response} from "express";
import * as ratingService from "../service/rating.service";
import {RatingDTO} from "../dto/rating.data";

export const saveRating = async (req: Request, res: Response) => {
    try {
        const ratingData: RatingDTO = req.body;
        
        // Validate rating
        if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
            return res.status(400).send({ error: "Rating must be between 1 and 5" });
        }

        // Check if rating already exists for this trip
        const existingRating = await ratingService.getRatingByTripId(ratingData.tripId);
        if (existingRating) {
            return res.status(400).send({ error: "Rating already exists for this trip" });
        }

        const rating = await ratingService.saveRating(ratingData);
        return res.status(201).send(rating);
    } catch (error) {
        return res.status(500).send(error);
    }
};

export const getRatingsByDriverId = async (req: Request, res: Response) => {
    try {
        const driverId = req.params.driverId;
        const ratings = await ratingService.getRatingsByDriverId(driverId);
        return res.status(200).send(ratings);
    } catch (error) {
        return res.status(500).send(error);
    }
};

export const getRatingByTripId = async (req: Request, res: Response) => {
    try {
        const tripId = req.params.tripId;
        const rating = await ratingService.getRatingByTripId(tripId);
        return res.status(200).send(rating);
    } catch (error) {
        return res.status(500).send(error);
    }
};





