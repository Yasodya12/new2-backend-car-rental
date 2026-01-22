import { Request, Response } from "express";

export function handleUpload(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    return res.status(200).json({
        message: "File uploaded successfully",
        filename: req.file.filename,
    });
}