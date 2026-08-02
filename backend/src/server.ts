import app from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger";

app.listen(env.PORT, () => {
  logger.info("====================================");
  logger.info("🚀 HydroNova Backend Started");
  logger.info(`🌍 Environment : ${env.NODE_ENV}`);
  logger.info(`📡 Port        : ${env.PORT}`);
  logger.info("====================================");
});