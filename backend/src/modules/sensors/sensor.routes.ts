import { Router } from "express";
import { handleGetHistory, handleGetLive, handleGetOverview, handlePostReading } from "./sensor.controller";

const router = Router();

// ESP32 Microcontroller endpoint to post live readings
router.post("/readings", handlePostReading);
router.post("/readings/esp32", handlePostReading);

// Frontend telemetry endpoints
router.get("/live", handleGetLive);
router.get("/history", handleGetHistory);
router.get("/overview", handleGetOverview);

export default router;
