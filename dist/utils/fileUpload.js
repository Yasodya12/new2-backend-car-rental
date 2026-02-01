"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVehicleImage = exports.uploadUserImage = void 0;
// utils/multer.middleware.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function createStorage(folderName) {
    const folderPath = path_1.default.join(__dirname, `../../public/${folderName}`);
    fs_1.default.mkdirSync(folderPath, { recursive: true });
    return multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, folderPath);
        },
        filename: function (req, file, cb) {
            const cleanedName = file.originalname.replace(/\s+/g, "_");
            cb(null, cleanedName);
        }
    });
}
exports.uploadUserImage = (0, multer_1.default)({ storage: createStorage("users") });
exports.uploadVehicleImage = (0, multer_1.default)({ storage: createStorage("vehicles") });
