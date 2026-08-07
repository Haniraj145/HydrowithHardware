import axios from "axios";

export interface LiveSensorData {
  ph: number;
  ec: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  tds: number;
  plantHealthScore: number;
  updatedAt: string;
}

const BACKEND_BASE_URLS = [
  import.meta.env.VITE_BACKEND_URL,
  "http://localhost:5000/api/v1/sensors",
  "http://127.0.0.1:5000/api/v1/sensors",
  "http://127.0.0.1:8000/api/v1/sensors",
  "http://localhost:8000/api/v1/sensors",
].filter((url): url is string => Boolean(url));

export async function fetchLiveSensors(): Promise<LiveSensorData | null> {
  let lastError: any = null;

  for (const url of BACKEND_BASE_URLS) {
    try {
      const response = await axios.get(`${url}/live`, { timeout: 3000 });
      if (response.data && response.data.success) {
        if (!response.data.data) {
          return null;
        }
        const d = response.data.data;
        return {
          ph: d.ph,
          ec: d.ec ?? (d.tds ? +(d.tds / 500).toFixed(1) : 0),
          temperature: d.temperature,
          humidity: d.humidity,
          waterLevel: d.waterLevel,
          tds: d.tds ?? Math.round((d.ec || 0) * 500),
          plantHealthScore: 84,
          updatedAt: new Date(d.createdAt || Date.now()).toLocaleTimeString(),
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to reach HydroNova backend server");
}

export async function fetchSensorHistory(limit = 24) {
  for (const url of BACKEND_BASE_URLS) {
    try {
      const response = await axios.get(`${url}/history?limit=${limit}`, { timeout: 3000 });
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch {
      // try next
    }
  }
  return [];
}
