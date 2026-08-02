export class HealthService {
  getHealthStatus() {
    return {
      status: "healthy",
      version: "v1",
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    };
  }
}

export const healthService = new HealthService();