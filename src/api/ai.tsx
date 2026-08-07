import axios from "axios";

const mlServiceUrls = [
  import.meta.env.VITE_ML_SERVICE_URL,
  "http://127.0.0.1:8001",
  "http://localhost:8001",
  "http://127.0.0.1:8000",
  "http://localhost:8000",
].filter((url): url is string => Boolean(url));

export async function predictDisease(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  let lastError: unknown = null;

  for (const baseUrl of Array.from(new Set(mlServiceUrls))) {
    try {
      const response = await axios.post(`${baseUrl}/predict`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      });

      return response.data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to reach the ML service. Please make sure the Python ML service is running on port 8001.");
}

