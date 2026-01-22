"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/file.upload.routes.ts
const express_1 = require("express");
const file_upload_controller_1 = require("../controllers/file.upload.controller");
const fileUpload_1 = require("../utils/fileUpload");
const fileUploadRoutes = (0, express_1.Router)();
fileUploadRoutes.post("/user", fileUpload_1.uploadUserImage.single("file"), file_upload_controller_1.handleUpload);
fileUploadRoutes.post("/vehicle", fileUpload_1.uploadVehicleImage.single("file"), file_upload_controller_1.handleUpload);
exports.default = fileUploadRoutes;
