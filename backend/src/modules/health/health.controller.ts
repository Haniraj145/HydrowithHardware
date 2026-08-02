import { Request, Response } from "express";
import { healthService } from "./health.service";
import { ApiResponse } from "../../shared/api/apiResponse";

export class HealthController {
  getHealth(req: Request, res: Response) {
    const data = healthService.getHealthStatus();

    res.status(200).json(
      ApiResponse.success(
        "Backend is healthy",
        data
      )
    );
  }
}

export const healthController = new HealthController();