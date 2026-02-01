"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = handleUpload;
function handleUpload(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    return res.status(200).json({
        message: "File uploaded successfully",
        filename: req.file.filename,
    });
}
