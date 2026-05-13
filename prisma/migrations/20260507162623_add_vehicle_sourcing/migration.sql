-- CreateEnum
CREATE TYPE "VehicleInternalStatus" AS ENUM ('NEW', 'TO_REVIEW', 'INTERESTING', 'TO_CALL', 'NEGOTIATION', 'BOUGHT', 'REJECTED', 'EXPIRED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "SourcingRule" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearMin" INTEGER,
    "yearMax" INTEGER,
    "priceMax" DOUBLE PRECISION,
    "mileageMax" INTEGER,
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourcingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleListing" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "externalId" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT,
    "title" TEXT,
    "description" TEXT,
    "year" INTEGER,
    "mileage" INTEGER,
    "price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "fuel" TEXT,
    "transmission" TEXT,
    "power" TEXT,
    "location" TEXT,
    "country" TEXT,
    "imageUrl" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "internalStatus" "VehicleInternalStatus" NOT NULL DEFAULT 'NEW',
    "sourcingRuleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleAnalysis" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "purchaseTargetPrice" DOUBLE PRECISION,
    "negotiationPrice" DOUBLE PRECISION,
    "repairCostEstimate" DOUBLE PRECISION,
    "transportCost" DOUBLE PRECISION,
    "customsCost" DOUBLE PRECISION,
    "otherCosts" DOUBLE PRECISION,
    "expectedSalePrice" DOUBLE PRECISION,
    "expectedMargin" DOUBLE PRECISION,
    "marginRate" DOUBLE PRECISION,
    "plannedWorks" TEXT,
    "notes" TEXT,
    "priorityScore" INTEGER,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleListing_sourceUrl_key" ON "VehicleListing"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleAnalysis_listingId_key" ON "VehicleAnalysis"("listingId");

-- AddForeignKey
ALTER TABLE "VehicleListing" ADD CONSTRAINT "VehicleListing_sourcingRuleId_fkey" FOREIGN KEY ("sourcingRuleId") REFERENCES "SourcingRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleAnalysis" ADD CONSTRAINT "VehicleAnalysis_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "VehicleListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
