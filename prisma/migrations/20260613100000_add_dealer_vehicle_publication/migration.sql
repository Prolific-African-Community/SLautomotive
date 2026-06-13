-- CreateEnum
CREATE TYPE "DealerVehicleStatus" AS ENUM ('DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN');

-- CreateTable
CREATE TABLE "DealerVehicle" (
    "id" TEXT NOT NULL,
    "sourcingListingId" TEXT,
    "stockReference" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "source" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT,
    "title" TEXT,
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
    "description" TEXT,
    "dealerNotes" TEXT,
    "status" "DealerVehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DealerVehicle_sourcingListingId_key" ON "DealerVehicle"("sourcingListingId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerVehicle_stockReference_key" ON "DealerVehicle"("stockReference");

-- AddForeignKey
ALTER TABLE "DealerVehicle" ADD CONSTRAINT "DealerVehicle_sourcingListingId_fkey" FOREIGN KEY ("sourcingListingId") REFERENCES "VehicleListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
