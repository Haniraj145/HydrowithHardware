import { Router } from "express";
import multer from "multer";
import AIController from "./ai.controller";

const router = Router();

const upload = multer({
    dest: "uploads/",
});

router.post(
    "/predict",
    upload.single("file"),   // <-- change image -> file
    AIController.predict
);

export default router;