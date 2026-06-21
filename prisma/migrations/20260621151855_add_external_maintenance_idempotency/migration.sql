-- CreateIndex
CREATE UNIQUE INDEX "ExternalMaintenanceRequest_sourceCompany_externalRequestId_key"
ON "ExternalMaintenanceRequest"("sourceCompany", "externalRequestId");
