export interface SensorTelemetryInput {
  deviceId?: string;
  temperature: number;
  humidity: number;
  ph: number;
  waterLevel: number;
  tds: number;
  ec?: number;
}

export interface SensorTelemetryReading {
  id: string;
  deviceId: string;
  temperature: number;
  humidity: number;
  ph: number;
  waterLevel: number;
  tds: number;
  ec: number;
  createdAt: string;
}

export interface SensorOverview {
  ph: { current: number; status: string; range: string };
  ec: { current: number; status: string; range: string };
  waterTemp: { current: number; status: string; range: string };
  humidity: { current: number; status: string; range: string };
  waterLevel: { current: number; status: string; range: string };
  tds: { current: number; status: string };
  plantHealthScore: number;
}
