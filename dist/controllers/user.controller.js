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
exports.toggleAvailability = exports.getDriversNearby = exports.getUserByEmail = exports.getAllUsersByRole = exports.getAllUser = exports.getUserById = exports.deleteUser = exports.updateUser = exports.saveUser = void 0;
const userService = __importStar(require("../service/user.service"));
const saveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const validationError = yield userService.validateUser(userData);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedUser = yield userService.registerUser(userData);
        return res.status(201).send(savedUser);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.saveUser = saveUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = req.body;
        const validationError = yield userService.validateUser(user);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedUser = yield userService.updateUser(id, user);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(updatedUser);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedUser = yield userService.deleteUser(id);
        if (!deletedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(deletedUser);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.deleteUser = deleteUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield userService.getUserById(id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(user);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getUserById = getUserById;
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userService.getAllUser();
        return res.status(200).send(users);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getAllUser = getAllUser;
const getAllUsersByRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.params.role;
        const users = yield userService.getAllUsersByRole(role);
        return res.status(200).send(users);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getAllUsersByRole = getAllUsersByRole;
const getUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.params.email;
        const user = yield userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(user);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getUserByEmail = getUserByEmail;
const getDriversNearby = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radius = parseFloat(req.query.radius) || 5;
        const date = req.query.date;
        const endDate = req.query.endDate;
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).send({ error: "Invalid coordinates. Please provide valid lat and lng." });
        }
        const drivers = yield userService.getDriversNearby(lat, lng, radius, date, endDate);
        return res.status(200).send(drivers);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getDriversNearby = getDriversNearby;
const toggleAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield userService.getUserById(id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        const updatedUser = yield userService.toggleAvailability(id);
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        return res.status(200).send(updatedUser);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.toggleAvailability = toggleAvailability;
