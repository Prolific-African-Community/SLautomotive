-- CreateTable
CREATE TABLE "ExternalMaintenanceInterventionLine" (
    "id" TEXT NOT NULL,
    "externalMaintenanceRequestId" TEXT NOT NULL,
    "interventionCodeId" TEXT,
    "code" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMaintenanceInterventionLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalMaintenanceInterventionLine_externalMaintenanceRequestId_idx" ON "ExternalMaintenanceInterventionLine"("externalMaintenanceRequestId");

-- AddForeignKey
ALTER TABLE "ExternalMaintenanceInterventionLine" ADD CONSTRAINT "ExternalMaintenanceInterventionLine_externalMaintenanceRequestId_fkey" FOREIGN KEY ("externalMaintenanceRequestId") REFERENCES "ExternalMaintenanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMaintenanceInterventionLine" ADD CONSTRAINT "ExternalMaintenanceInterventionLine_interventionCodeId_fkey" FOREIGN KEY ("interventionCodeId") REFERENCES "InterventionCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
