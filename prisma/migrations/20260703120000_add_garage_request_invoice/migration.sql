ALTER TABLE "GarageRequest"
ADD COLUMN "invoiceNumber" TEXT,
ADD COLUMN "invoiceTotal" DOUBLE PRECISION,
ADD COLUMN "invoiceCurrency" TEXT DEFAULT 'EUR',
ADD COLUMN "invoicePdfUrl" TEXT,
ADD COLUMN "invoicePdfGeneratedAt" TIMESTAMP(3);
