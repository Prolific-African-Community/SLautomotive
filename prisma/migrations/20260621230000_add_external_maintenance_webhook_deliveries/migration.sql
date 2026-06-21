CREATE TYPE "ExternalMaintenanceWebhookTarget" AS ENUM ('NOVOTRALUX');

CREATE TYPE "ExternalMaintenanceWebhookDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED');

CREATE TABLE "ExternalMaintenanceWebhookDelivery" (
    "id" TEXT NOT NULL,
    "externalMaintenanceRequestId" TEXT NOT NULL,
    "targetSystem" "ExternalMaintenanceWebhookTarget" NOT NULL DEFAULT 'NOVOTRALUX',
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" "ExternalMaintenanceWebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "httpStatus" INTEGER,
    "responseBody" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMaintenanceWebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExternalMaintenanceWebhookDelivery_externalMaintenanceRequestId_idx"
ON "ExternalMaintenanceWebhookDelivery"("externalMaintenanceRequestId");

CREATE INDEX "ExternalMaintenanceWebhookDelivery_status_idx"
ON "ExternalMaintenanceWebhookDelivery"("status");

CREATE INDEX "ExternalMaintenanceWebhookDelivery_targetSystem_idx"
ON "ExternalMaintenanceWebhookDelivery"("targetSystem");

CREATE INDEX "ExternalMaintenanceWebhookDelivery_createdAt_idx"
ON "ExternalMaintenanceWebhookDelivery"("createdAt");

ALTER TABLE "ExternalMaintenanceWebhookDelivery"
ADD CONSTRAINT "ExternalMaintenanceWebhookDelivery_externalMaintenanceRequestId_fkey"
FOREIGN KEY ("externalMaintenanceRequestId") REFERENCES "ExternalMaintenanceRequest"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
