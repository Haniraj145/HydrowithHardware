import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { ApiResponse } from "../../shared/api/apiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";
import { authRepository } from "./auth.repository";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);

      return res.status(201).json(
        ApiResponse.success("User registered successfully", user)
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      return res.status(200).json(
        ApiResponse.success("Login successful", result)
      );
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refresh(refreshToken);

      return res.status(200).json(
        ApiResponse.success("Access token refreshed", result)
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.logout(refreshToken);

      return res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      const result = await authService.verifyEmail(token as string);

      return res.json(ApiResponse.success("Email verified", result));
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authRepository.findUserById(req.user!.userId);

      return res.json(ApiResponse.success("Current user", user));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      return res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password);

      return res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json(ApiResponse.error("Email is required"));
      }

      const result = await authService.resendVerification(email);

      return res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
