import { Request, Response } from "express";
import { getLiveSensorReading, getSensorHistory, getSensorOverview, recordSensorReading } from "./sensor.service";

export async function handlePostReading(req: Request, res: Response) {
  try {
    const { temperature, humidity, ph, waterLevel, tds, ec, deviceId } = req.body;

    if (temperature === undefined || humidity === undefined || ph === undefined || waterLevel === undefined) {
      res.status(400).json({
        success: false,
        error: "Missing required sensor fields: temperature, humidity, ph, waterLevel",
      });
      return;
    }

    const reading = await recordSensorReading({
      temperature: Number(temperature),
      humidity: Number(humidity),
      ph: Number(ph),
      waterLevel: Number(waterLevel),
      tds: tds !== undefined ? Number(tds) : (ec !== undefined ? Math.round(Number(ec) * 500) : 0),
      ec: ec !== undefined ? Number(ec) : (tds !== undefined ? +(Number(tds) / 500).toFixed(1) : undefined),
      deviceId: deviceId ? String(deviceId) : "esp32-hydro-01",
    });

    res.status(201).json({
      success: true,
      data: reading,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to record sensor telemetry",
    });
  }
}

export async function handleGetLive(req: Request, res: Response) {
  try {
    const reading = await getLiveSensorReading();
    res.json({
      success: true,
      data: reading,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch live sensor reading",
    });
  }
}

export async function handleGetHistory(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 24;
    const history = await getSensorHistory(limit);
    res.json({
      success: true,
      data: history,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch sensor history",
    });
  }
}

export async function handleGetOverview(req: Request, res: Response) {
  try {
    const overview = await getSensorOverview();
    res.json({
      success: true,
      data: overview,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch sensor overview",
    });
  }
}
