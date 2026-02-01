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
exports.getVehiclesNearby = exports.deleteVehicle = exports.updateVehicle = exports.saveVehicle = exports.getVehicleById = exports.getAllVehicles = void 0;
const vehicleService = __importStar(require("../service/vehicle.service"));
const getAllVehicles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicles = yield vehicleService.getAllVehicles();
        return res.status(200).send(vehicles);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getAllVehicles = getAllVehicles;
const getVehicleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const vehicle = yield vehicleService.getVehicleById(id);
        if (!vehicle) {
            return res.status(404).send({ error: "Vehicle not found" });
        }
        return res.status(200).send(vehicle);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getVehicleById = getVehicleById;
const saveVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicle = req.body;
        const validationError = yield vehicleService.validateVehicle(vehicle);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedVehicle = yield vehicleService.saveVehicle(vehicle);
        return res.status(201).send(savedVehicle);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.saveVehicle = saveVehicle;
const updateVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const vehicle = req.body;
        const validationError = yield vehicleService.validateVehicle(vehicle);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedVehicle = yield vehicleService.updateVehicle(id, vehicle);
        if (!updatedVehicle) {
            return res.status(404).send({ error: "Vehicle not found" });
        }
        return res.status(200).send(updatedVehicle);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateVehicle = updateVehicle;
const deleteVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedVehicle = yield vehicleService.deleteVehicle(id);
        if (!deletedVehicle) {
            return res.status(404).send({ error: "Vehicle not found" });
        }
        return res.status(200).send(deletedVehicle);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.deleteVehicle = deleteVehicle;
const getVehiclesNearby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radius = parseFloat(req.query.radius) || 5;
        const date = req.query.date;
        const endDate = req.query.endDate;
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).send({ error: "Invalid coordinates. Please provide valid lat and lng." });
        }
        const vehicles = yield vehicleService.getVehiclesNearby(lat, lng, radius, date, endDate);
        return res.status(200).send(vehicles);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getVehiclesNearby = getVehiclesNearby;
