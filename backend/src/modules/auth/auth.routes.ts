import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import {
  registerSchema,
  loginSchema,
} from "./auth.validation";
import { verifyEmail } from "./controllers/verify-email.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  authController.refresh
);

router.post(
  "/logout",
  authController.logout
);

// Protected route
router.get(
  "/me",
  authenticate,
  authController.me
);

// Email verification — uses redirect-based controller so clicking the link
// in the email redirects the browser to the frontend with a status query param
router.get(
  "/verify-email",
  verifyEmail
);

router.post(
  "/resend-verification",
  authController.resendVerification
);

router.post(
  "/forgot-password",
  authController.forgotPassword
);

router.post(
  "/reset-password",
  authController.resetPassword
);

export default router;