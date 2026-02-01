"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDemandSignals = exports.createDemandSignal = void 0;
const demand_model_1 = __importDefault(require("../model/demand.model"));
const createDemandSignal = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Basic throttling: Check if this user already logged a signal for a similar location 
    // within the last 10 minutes to avoid spam.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingSignal = yield demand_model_1.default.findOne({
        userId: data.userId,
        // Match approximate location (within ~100m) or same address
        $or: [
            { address: data.address },
            {
                lat: { $gte: data.lat - 0.001, $lte: data.lat + 0.001 },
                lng: { $gte: data.lng - 0.001, $lte: data.lng + 0.001 }
            }
        ],
        createdAt: { $gte: tenMinutesAgo }
    });
    if (existingSignal) {
        return existingSignal; // Return existing instead of creating new trip signal
    }
    return yield demand_model_1.default.create(data);
});
exports.createDemandSignal = createDemandSignal;
const getAllDemandSignals = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield demand_model_1.default.find()
        .populate('userId', 'name email contactNumber')
        .sort({ createdAt: -1 });
});
exports.getAllDemandSignals = getAllDemandSignals;
