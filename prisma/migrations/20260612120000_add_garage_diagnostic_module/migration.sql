-- CreateEnum
CREATE TYPE "GarageRequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'WAITING_CLIENT', 'QUOTE_READY', 'QUOTE_SENT', 'ACCEPTED', 'REJECTED', 'DONE');

-- CreateEnum
CREATE TYPE "GarageRequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "GarageRequest" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "vehicleBrand" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" INTEGER,
    "mileage" INTEGER,
    "plateNumber" TEXT,
    "problemType" TEXT,
    "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "preferredContactMethod" TEXT,
    "preferredDate" TIMESTAMP(3),
    "status" "GarageRequestStatus" NOT NULL DEFAULT 'NEW',
    "priority" "GarageRequestPriority" NOT NULL DEFAULT 'NORMAL',
    "source" TEXT DEFAULT 'website',
    "quoteTotal" DOUBLE PRECISION,
    "quoteNote" TEXT,
    "mechanicNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarageRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "defaultQty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterventionCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarageInterventionLine" (
    "id" TEXT NOT NULL,
    "garageRequestId" TEXT NOT NULL,
    "interventionCodeId" TEXT,
    "code" TEXT,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarageInterventionLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterventionCode_code_key" ON "InterventionCode"("code");

-- AddForeignKey
ALTER TABLE "GarageInterventionLine" ADD CONSTRAINT "GarageInterventionLine_garageRequestId_fkey" FOREIGN KEY ("garageRequestId") REFERENCES "GarageRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarageInterventionLine" ADD CONSTRAINT "GarageInterventionLine_interventionCodeId_fkey" FOREIGN KEY ("interventionCodeId") REFERENCES "InterventionCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
