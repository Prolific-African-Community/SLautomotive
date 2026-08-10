ALTER TABLE "GarageRequest"
ADD COLUMN "quoteNumber" TEXT,
ADD COLUMN "quoteCurrency" TEXT DEFAULT 'EUR',
ADD COLUMN "quotePdfUrl" TEXT,
ADD COLUMN "quotePdfGeneratedAt" TIMESTAMP(3);
