ALTER TABLE "GarageRequest"
ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "ExternalMaintenanceRequest"
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "GarageRequest_archivedAt_idx"
ON "GarageRequest"("archivedAt");

CREATE INDEX "ExternalMaintenanceRequest_archivedAt_idx"
ON "ExternalMaintenanceRequest"("archivedAt");
