import { Request, Response } from "express";
import DriverDocument from "../model/driverDocument.model";
import { createNotification } from "../service/notification.service";

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { type, documentUrl, expiryDate } = req.body;
        const driverId = (req as any).user.id;

        if (!type || !documentUrl) {
            return res.status(400).json({ error: "Document type and URL are required" });
        }

        // Check if a document of this type already exists for the driver
        // If it does, we update it; otherwise, we create a new one.
        const existingDoc = await DriverDocument.findOne({ driverId, type });

        if (existingDoc) {
            existingDoc.documentUrl = documentUrl;
            existingDoc.expiryDate = expiryDate;
            existingDoc.status = "Pending"; // Reset status to pending on re-upload
            await existingDoc.save();
            return res.status(200).json({ message: "Document updated successfully", document: existingDoc });
        }

        const newDoc = await DriverDocument.create({
            driverId,
            type,
            documentUrl,
            expiryDate,
            status: "Pending",
        });

        // Notify admin about new document upload
        const User = (await import("../model/user.model")).default;
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
            await createNotification(
                admin._id.toString(),
                "New Document Uploaded",
                `A driver has uploaded a new ${type} document for review.`,
                "Info",
                `/documents`
            );
        }

        res.status(201).json({ message: "Document uploaded successfully", document: newDoc });
    } catch (error: any) {
        console.error("Error uploading document:", error);
        res.status(500).json({ error: error.message || "Failed to upload document" });
    }
};

export const verifyDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!["Verified", "Rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be Verified or Rejected" });
        }

        const updatedDoc = await DriverDocument.findByIdAndUpdate(
            id,
            { status, adminNotes },
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({ error: "Document not found" });
        }

        // Notify driver about document verification
        await createNotification(
            updatedDoc.driverId.toString(),
            status === "Verified" ? "Document Verified" : "Document Rejected",
            status === "Verified"
                ? `Your ${updatedDoc.type} document has been verified successfully.`
                : `Your ${updatedDoc.type} document has been rejected. ${adminNotes || "Please re-upload."}`,
            status === "Verified" ? "Success" : "Error",
            `/documents`
        );

        res.status(200).json({ message: `Document ${status.toLowerCase()} successfully`, document: updatedDoc });
    } catch (error: any) {
        console.error("Error verifying document:", error);
        res.status(500).json({ error: error.message || "Failed to verify document" });
    }
};

export const getDriverDocuments = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const documents = await DriverDocument.find({ driverId });
        res.status(200).json(documents);
    } catch (error: any) {
        console.error("Error fetching driver documents:", error);
        res.status(500).json({ error: error.message || "Failed to fetch documents" });
    }
};

export const getPendingDocuments = async (req: Request, res: Response) => {
    try {
        const documents = await DriverDocument.find({ status: "Pending" }).populate("driverId", "name email");
        res.status(200).json(documents);
    } catch (error: any) {
        console.error("Error fetching pending documents:", error);
        res.status(500).json({ error: error.message || "Failed to fetch pending documents" });
    }
};
