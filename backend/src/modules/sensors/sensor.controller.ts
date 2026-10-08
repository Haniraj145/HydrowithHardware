import { Request, Response } from "express";
import { getLiveSensorReading, getSensorHistory, getSensorOverview, recordSensorReading } from "./sensor.service";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a single sensor field against a physical range.
 * - If the field is absent (null/undefined/""), it is valid — stored as NULL.
 * - If present, it must be a finite number within [min, max].
 */
function validateField(name: string, raw: unknown, min: number, max: number): ValidationError | null {
  if (raw === undefined || raw === null || raw === "") return null; // absent → NULL, not an error

  const n = Number(raw);
  if (!isFinite(n) || isNaN(n)) {
    return { field: name, message: `${name} must be a valid number (received: ${JSON.stringify(raw)})` };
  }
  if (n < min || n > max) {
    return { field: name, message: `${name} out of range: expected ${min}–${max}, received ${n}` };
  }
  return null;
}

function validateSensorPayload(body: Record<string, unknown>): ValidationError[] {
  const { deviceId, temperature, humidity, ph, tds, waterLevel, ec } = body;
  const errors: ValidationError[] = [];

  // deviceId — required string
  if (!deviceId || typeof deviceId !== "string" || deviceId.trim() === "") {
    errors.push({ field: "deviceId", message: "deviceId is required" });
  }

  // temperature — required, DHT11/DS18B20 physical range (-40 to 85 °C)
  if (temperature == null || temperature === "") {
    errors.push({ field: "temperature", message: "temperature is required" });
  } else {
    const e = validateField("temperature", temperature, -40, 85);
    if (e) errors.push(e);
  }

  // humidity — required, 0–100 %
  if (humidity == null || humidity === "") {
    errors.push({ field: "humidity", message: "humidity is required" });
  } else {
    const e = validateField("humidity", humidity, 0, 100);
    if (e) errors.push(e);
  }

  // ph — required, 0–14 pH
  if (ph == null || ph === "") {
    errors.push({ field: "ph", message: "ph is required" });
  } else {
    const e = validateField("ph", ph, 0, 14);
    if (e) errors.push(e);
  }

  // tds — required, 0–9999 ppm
  if (tds == null || tds === "") {
    errors.push({ field: "tds", message: "tds is required" });
  } else {
    const e = validateField("tds", tds, 0, 9999);
    if (e) errors.push(e);
  }

  // optional fields — only validated when present
  const optW = validateField("waterLevel", waterLevel, 0, 100); if (optW) errors.push(optW);
  const optEC = validateField("ec", ec, 0, 20); if (optEC) errors.push(optEC);

  return errors;
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

export async function handlePostReading(req: Request, res: Response) {
  try {
    const body = req.body as Record<string, unknown>;
    const { temperature, humidity, ph, waterLevel, tds, ec, deviceId } = body;

    // Reject corrupt or out-of-range values immediately — HTTP 400
    const validationErrors = validateSensorPayload(body);
    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        error: "Invalid sensor payload",
        details: validationErrors,
      });
      return;
    }

    // Only store values actually sent by the ESP32.
    // Any optional field absent in the payload is written as NULL — no fallback defaults.
    const reading = await recordSensorReading({
      temperature: Number(temperature),
      humidity:    Number(humidity),
      ph:          Number(ph),
      tds:         Number(tds),
      waterLevel:  waterLevel != null ? Number(waterLevel) : null,
      ec:          ec != null ? Number(ec) : null,
      deviceId:    String(deviceId),
    });

    res.status(200).json({
      success: true,
      message: "Sensor reading saved",
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
