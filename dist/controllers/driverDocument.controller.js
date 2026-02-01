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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingDocuments = exports.getDriverDocuments = exports.verifyDocument = exports.uploadDocument = void 0;
const driverDocument_model_1 = __importDefault(require("../model/driverDocument.model"));
const notification_service_1 = require("../service/notification.service");
const uploadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, documentUrl, expiryDate } = req.body;
        const driverId = req.user.id;
        if (!type || !documentUrl) {
            return res.status(400).json({ error: "Document type and URL are required" });
        }
        // Check if a document of this type already exists for the driver
        // If it does, we update it; otherwise, we create a new one.
        const existingDoc = yield driverDocument_model_1.default.findOne({ driverId, type });
        if (existingDoc) {
            existingDoc.documentUrl = documentUrl;
            existingDoc.expiryDate = expiryDate;
            existingDoc.status = "Pending"; // Reset status to pending on re-upload
            yield existingDoc.save();
            return res.status(200).json({ message: "Document updated successfully", document: existingDoc });
        }
        const newDoc = yield driverDocument_model_1.default.create({
            driverId,
            type,
            documentUrl,
            expiryDate,
            status: "Pending",
        });
        // Notify admin about new document upload
        const User = (yield Promise.resolve().then(() => __importStar(require("../model/user.model")))).default;
        const admins = yield User.find({ role: "admin" });
        for (const admin of admins) {
            yield (0, notification_service_1.createNotification)(admin._id.toString(), "New Document Uploaded", `A driver has uploaded a new ${type} document for review.`, "Info", `/documents`);
        }
        res.status(201).json({ message: "Document uploaded successfully", document: newDoc });
    }
    catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ error: error.message || "Failed to upload document" });
    }
});
exports.uploadDocument = uploadDocument;
const verifyDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        if (!["Verified", "Rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be Verified or Rejected" });
        }
        const updatedDoc = yield driverDocument_model_1.default.findByIdAndUpdate(id, { status, adminNotes }, { new: true });
        if (!updatedDoc) {
            return res.status(404).json({ error: "Document not found" });
        }
        // Notify driver about document verification
        yield (0, notification_service_1.createNotification)(updatedDoc.driverId.toString(), status === "Verified" ? "Document Verified" : "Document Rejected", status === "Verified"
            ? `Your ${updatedDoc.type} document has been verified successfully.`
            : `Your ${updatedDoc.type} document has been rejected. ${adminNotes || "Please re-upload."}`, status === "Verified" ? "Success" : "Error", `/documents`);
        res.status(200).json({ message: `Document ${status.toLowerCase()} successfully`, document: updatedDoc });
    }
    catch (error) {
        console.error("Error verifying document:", error);
        res.status(500).json({ error: error.message || "Failed to verify document" });
    }
});
exports.verifyDocument = verifyDocument;
const getDriverDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverId } = req.params;
        const documents = yield driverDocument_model_1.default.find({ driverId });
        res.status(200).json(documents);
    }
    catch (error) {
        console.error("Error fetching driver documents:", error);
        res.status(500).json({ error: error.message || "Failed to fetch documents" });
    }
});
exports.getDriverDocuments = getDriverDocuments;
const getPendingDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const documents = yield driverDocument_model_1.default.find({ status: "Pending" }).populate("driverId", "name email");
        res.status(200).json(documents);
    }
    catch (error) {
        console.error("Error fetching pending documents:", error);
        res.status(500).json({ error: error.message || "Failed to fetch pending documents" });
    }
});
exports.getPendingDocuments = getPendingDocuments;
