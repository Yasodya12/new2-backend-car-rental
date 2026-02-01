"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatingByTripId = exports.getRatingsByDriverId = exports.saveRating = void 0;
const ratingService = __importStar(require("../service/rating.service"));
const saveRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratingData = req.body;
        // Validate rating
        if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
            return res.status(400).send({ error: "Rating must be between 1 and 5" });
        }
        // Check if rating already exists for this trip
        const existingRating = yield ratingService.getRatingByTripId(ratingData.tripId);
        if (existingRating) {
            return res.status(400).send({ error: "Rating already exists for this trip" });
        }
        const rating = yield ratingService.saveRating(ratingData);
        return res.status(201).send(rating);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.saveRating = saveRating;
const getRatingsByDriverId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverId = req.params.driverId;
        const ratings = yield ratingService.getRatingsByDriverId(driverId);
        return res.status(200).send(ratings);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getRatingsByDriverId = getRatingsByDriverId;
const getRatingByTripId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tripId = req.params.tripId;
        const rating = yield ratingService.getRatingByTripId(tripId);
        return res.status(200).send(rating);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getRatingByTripId = getRatingByTripId;
