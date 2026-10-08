-- CreateTable (idempotent — skipped if SensorReading already exists from db push)
CREATE TABLE IF NOT EXISTS "public"."SensorReading" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL DEFAULT 'esp32-hydro-01',
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "ph" DOUBLE PRECISION,
    "waterLevel" DOUBLE PRECISION,
    "tds" DOUBLE PRECISION,
    "ec" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "SensorReading_createdAt_idx" ON "public"."SensorReading"("createdAt");

-- AlterTable — drop NOT NULL from all sensor value columns so missing ESP32 readings are stored as NULL
ALTER TABLE "public"."SensorReading" ALTER COLUMN "temperature" DROP NOT NULL;
ALTER TABLE "public"."SensorReading" ALTER COLUMN "humidity" DROP NOT NULL;
ALTER TABLE "public"."SensorReading" ALTER COLUMN "ph" DROP NOT NULL;
ALTER TABLE "public"."SensorReading" ALTER COLUMN "waterLevel" DROP NOT NULL;
ALTER TABLE "public"."SensorReading" ALTER COLUMN "tds" DROP NOT NULL;
ALTER TABLE "public"."SensorReading" ALTER COLUMN "ec" DROP NOT NULL;
