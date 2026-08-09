export interface SensorTelemetryInput {
  deviceId?: string;
  temperature?: number | null;
  humidity?: number | null;
  ph?: number | null;
  waterLevel?: number | null;
  tds?: number | null;
  ec?: number | null;
}

export interface SensorTelemetryReading {
  id: string;
  deviceId: string;
  temperature: number | null;
  humidity: number | null;
  ph: number | null;
  waterLevel: number | null;
  tds: number | null;
  ec: number | null;
  createdAt: string;
}

export interface SensorOverview {
  ph: { current: number | null; status: string; range: string };
  ec: { current: number | null; status: string; range: string };
  waterTemp: { current: number | null; status: string; range: string };
  humidity: { current: number | null; status: string; range: string };
  waterLevel: { current: number | null; status: string; range: string };
  tds: { current: number | null; status: string };
  plantHealthScore: number | null;
}
