
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string(),

  JWT_SECRET: z.string(),

  JWT_REFRESH_SECRET: z.string(),

  CLIENT_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);