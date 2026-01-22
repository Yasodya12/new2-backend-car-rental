// utils/multer.middleware.ts
import multer from "multer";
import path from "path";
import fs from "fs";

function createStorage(folderName: string) {
    const folderPath = path.join(__dirname, `../../public/${folderName}`);
    fs.mkdirSync(folderPath, { recursive: true });

    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, folderPath);
        },
        filename: function (req, file, cb) {
            const cleanedName = file.originalname.replace(/\s+/g, "_");
            cb(null, cleanedName);
        }
    });
}

export const uploadUserImage = multer({ storage: createStorage("users") });
export const uploadVehicleImage = multer({ storage: createStorage("vehicles") });
