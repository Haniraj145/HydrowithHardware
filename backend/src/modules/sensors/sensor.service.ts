import { prisma } from "../../lib/prisma";
import { SensorOverview, SensorTelemetryInput, SensorTelemetryReading } from "./sensor.types";

export async function recordSensorReading(input: SensorTelemetryInput): Promise<SensorTelemetryReading> {
  const ec = input.ec ?? (input.tds ? +(input.tds / 500).toFixed(1) : 1.6);
  const tds = input.tds ?? Math.round(ec * 500);
  const deviceId = input.deviceId || "esp32-hydro-01";

  const dbReading = await prisma.sensorReading.create({
    data: {
      deviceId,
      temperature: +input.temperature.toFixed(1),
      humidity: +input.humidity.toFixed(1),
      ph: +input.ph.toFixed(2),
      waterLevel: +input.waterLevel.toFixed(1),
      tds,
      ec,
    },
  });

  return {
    id: dbReading.id,
    deviceId: dbReading.deviceId,
    temperature: dbReading.temperature,
    humidity: dbReading.humidity,
    ph: dbReading.ph,
    waterLevel: dbReading.waterLevel,
    tds: dbReading.tds,
    ec: dbReading.ec,
    createdAt: dbReading.createdAt.toISOString(),
  };
}

export async function getLiveSensorReading(): Promise<SensorTelemetryReading | null> {
  const dbReading = await prisma.sensorReading.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!dbReading) {
    return null;
  }

  return {
    id: dbReading.id,
    deviceId: dbReading.deviceId,
    temperature: dbReading.temperature,
    humidity: dbReading.humidity,
    ph: dbReading.ph,
    waterLevel: dbReading.waterLevel,
    tds: dbReading.tds,
    ec: dbReading.ec,
    createdAt: dbReading.createdAt.toISOString(),
  };
}

export async function getSensorHistory(limit = 24): Promise<SensorTelemetryReading[]> {
  const dbReadings = await prisma.sensorReading.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  if (!dbReadings || dbReadings.length === 0) {
    return [];
  }

  return dbReadings.reverse().map((r) => ({
    id: r.id,
    deviceId: r.deviceId,
    temperature: r.temperature,
    humidity: r.humidity,
    ph: r.ph,
    waterLevel: r.waterLevel,
    tds: r.tds,
    ec: r.ec,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getSensorOverview(): Promise<SensorOverview | null> {
  const current = await getLiveSensorReading();
  if (!current) {
    return null;
  }

  const phStatus = current.ph >= 5.5 && current.ph <= 6.5 ? "Optimal" : current.ph < 5.5 ? "Low" : "High";
  const ecStatus = current.ec >= 1.2 && current.ec <= 2.0 ? "Optimal" : current.ec < 1.2 ? "Low" : "High";
  const tempStatus = current.temperature >= 18 && current.temperature <= 24 ? "Optimal" : "Check";
  const humStatus = current.humidity >= 50 && current.humidity <= 70 ? "Optimal" : "Check";
  const wlStatus = current.waterLevel >= 50 ? "Good" : "Low";

  return {
    ph: { current: current.ph, status: phStatus, range: "5.5 – 6.5" },
    ec: { current: current.ec, status: ecStatus, range: "1.2 – 2.0" },
    waterTemp: { current: current.temperature, status: tempStatus, range: "18 – 24 °C" },
    humidity: { current: current.humidity, status: humStatus, range: "50 – 70 %" },
    waterLevel: { current: current.waterLevel, status: wlStatus, range: "> 50 %" },
    tds: { current: current.tds, status: "Normal" },
    plantHealthScore: 84,
  };
}

