import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import aiRoutes from "./modules/ai/ai.routes";
import { errorMiddleware } from "./middleware/error.middleware";


const app = express();

// Security Middleware
app.use(helmet());

// Enable CORS
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// Compress Responses
app.use(compression());

// Parse JSON
app.use(express.json());

// Parse URL Encoded Data
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use(errorMiddleware);

export default app;