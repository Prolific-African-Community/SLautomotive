-- CreateEnum
CREATE TYPE "ExternalMaintenanceSourceCompany" AS ENUM ('NOVOTRALUX');

-- CreateEnum
CREATE TYPE "ExternalMaintenanceVehicleType" AS ENUM ('TRUCK', 'TRAILER');

-- CreateEnum
CREATE TYPE "ExternalMaintenanceInterventionType" AS ENUM (
    'DIAGNOSTIC',
    'TIRES',
    'BRAKES',
    'OIL_SERVICE',
    'ELECTRICAL',
    'BODYWORK',
    'TRAILER_REPAIR',
    'SAFETY_CHECK',
    'OTHER'
);

-- CreateEnum
CREATE TYPE "ExternalMaintenanceUrgency" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ExternalMaintenanceStatus" AS ENUM (
    'RECEIVED',
    'UNDER_REVIEW',
    'MORE_INFO_REQUESTED',
    'QUOTE_PREPARING',
    'QUOTE_SENT',
    'QUOTE_APPROVED',
    'QUOTE_REJECTED',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'INVOICED',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "ExternalMaintenanceRequest" (
    "id" TEXT NOT NULL,
    "sourceCompany" "ExternalMaintenanceSourceCompany" NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "externalRequestId" TEXT NOT NULL,
    "externalVehicleId" TEXT,
    "vehicleType" "ExternalMaintenanceVehicleType" NOT NULL,
    "plateNumber" TEXT,
    "interventionType" "ExternalMaintenanceInterventionType" NOT NULL,
    "urgency" "ExternalMaintenanceUrgency" NOT NULL DEFAULT 'NORMAL',
    "status" "ExternalMaintenanceStatus" NOT NULL DEFAULT 'RECEIVED',
    "mileage" INTEGER,
    "immobilizationRequired" BOOLEAN NOT NULL DEFAULT false,
    "preferredDate" TIMESTAMP(3),
    "issueDescription" TEXT NOT NULL,
    "internalNotes" TEXT,
    "quoteAmount" DOUBLE PRECISION,
    "invoiceAmount" DOUBLE PRECISION,
    "quotePdfUrl" TEXT,
    "invoicePdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalMaintenanceStatusHistory" (
    "id" TEXT NOT NULL,
    "externalMaintenanceRequestId" TEXT NOT NULL,
    "oldStatus" "ExternalMaintenanceStatus",
    "newStatus" "ExternalMaintenanceStatus" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalMaintenanceStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalMaintenanceRequest_sourceCompany_idx" ON "ExternalMaintenanceRequest"("sourceCompany");

-- CreateIndex
CREATE INDEX "ExternalMaintenanceRequest_externalRequestId_idx" ON "ExternalMaintenanceRequest"("externalRequestId");

-- CreateIndex
CREATE INDEX "ExternalMaintenanceRequest_status_idx" ON "ExternalMaintenanceRequest"("status");

-- CreateIndex
CREATE INDEX "ExternalMaintenanceRequest_plateNumber_idx" ON "ExternalMaintenanceRequest"("plateNumber");

-- CreateIndex
CREATE INDEX "ExternalMaintenanceRequest_urgency_idx" ON "ExternalMaintenanceRequest"("urgency");

-- CreateIndex
CREATE INDEX "ExternalMaintenanceStatusHistory_externalMaintenanceRequestId_idx" ON "ExternalMaintenanceStatusHistory"("externalMaintenanceRequestId");

-- CreateIndex
CREATE INDEX "ExternalMaintenanceStatusHistory_newStatus_idx" ON "ExternalMaintenanceStatusHistory"("newStatus");

-- CreateIndex
CREATE INDEX "ExternalMaintenanceStatusHistory_createdAt_idx" ON "ExternalMaintenanceStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "ExternalMaintenanceStatusHistory" ADD CONSTRAINT "ExternalMaintenanceStatusHistory_externalMaintenanceRequestId_fkey" FOREIGN KEY ("externalMaintenanceRequestId") REFERENCES "ExternalMaintenanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
