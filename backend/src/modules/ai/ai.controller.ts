import { Request, Response } from "express";
import fs from "fs";
import AIService from "./ai.service";

class AIController {
  async predict(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const result = await AIService.predict(req.file.path);

      // Delete uploaded image
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        success: true,
        prediction: result,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Prediction failed",
        error: error.message,
      });
    }
  }
}

export default new AIController();