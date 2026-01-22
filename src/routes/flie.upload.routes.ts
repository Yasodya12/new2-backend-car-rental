// routes/file.upload.routes.ts
import { Router } from "express";
import { handleUpload } from "../controllers/file.upload.controller";
import {
    uploadUserImage,
    uploadVehicleImage,
} from "../utils/fileUpload";
import { authenticateToken } from "../middleware/auth.middleware";

const fileUploadRoutes: Router = Router();

fileUploadRoutes.use(authenticateToken);

fileUploadRoutes.post("/user", uploadUserImage.single("file"), handleUpload);
fileUploadRoutes.post("/vehicle", uploadVehicleImage.single("file"), handleUpload);

export default fileUploadRoutes;
