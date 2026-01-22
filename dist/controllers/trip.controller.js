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
exports.getTripsByDriverId = exports.deleteTrip = exports.updateTrip = exports.saveTrip = exports.getTripById = exports.getAllTrips = exports.updateTripStatus = void 0;
const tripService = __importStar(require("../service/trip.services"));
const trip_services_1 = require("../service/trip.services");
const updateTripStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!status) {
            return res.status(400).send({ error: "Status is required" });
        }
        const updatedTrip = yield (0, trip_services_1.updateTripStatus)(id, { status });
        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(updatedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateTripStatus = updateTripStatus;
const getAllTrips = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trips = yield tripService.getAllTrips();
        return res.status(200).send(trips);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getAllTrips = getAllTrips;
const getTripById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const trip = yield tripService.getTripById(id);
        if (!trip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(trip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getTripById = getTripById;
const saveTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trip = req.body;
        const validationError = yield tripService.validateTrip(trip);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedTrip = yield tripService.saveTrip(trip);
        return res.status(201).send(savedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.saveTrip = saveTrip;
const updateTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const trip = req.body;
        const validationError = yield tripService.validateTrip(trip);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedTrip = yield tripService.updateTrip(id, trip);
        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(updatedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateTrip = updateTrip;
const deleteTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedTrip = yield tripService.deleteTrip(id);
        if (!deletedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(deletedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.deleteTrip = deleteTrip;
const getTripsByDriverId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverId = req.params.driverId;
        console.log("Controller get trips by driverId", driverId);
        const trips = yield tripService.getTripsByDriverId(driverId);
        return res.status(200).send(trips);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getTripsByDriverId = getTripsByDriverId;
