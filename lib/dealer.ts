import { DealerVehicleStatus, PrismaClient, VehicleInternalStatus } from "@prisma/client";
import { prisma as defaultPrisma } from "./prisma";

export type ApiResponse =
  | {
      success: true;
      data: any;
    }
  | {
      success: false;
      message: string;
      error?: any;
    };

export function serializeError(error: any) {
  return {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    meta: error?.meta,
  };
}

export function parseNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  return undefined;
}

export function parseString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const text = String(value).trim();
  return text ? text : null;
}

export async function generateDealerStockReference(
  db: PrismaClient = defaultPrisma
) {
  const latest = await db.dealerVehicle.findFirst({
    where: {
      stockReference: {
        startsWith: "SLA-",
      },
    },
    orderBy: {
      stockReference: "desc",
    },
    select: {
      stockReference: true,
    },
  });

  const lastNumber = latest?.stockReference
    ? Number(latest.stockReference.replace("SLA-", ""))
    : 0;
  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

  return `SLA-${String(nextNumber).padStart(4, "0")}`;
}

export function buildDealerVehicleDataFromListing(listing: any, stockReference: string) {
  const expectedSalePrice = listing.analysis?.expectedSalePrice;
  const title =
    listing.title ||
    [listing.brand, listing.model, listing.version].filter(Boolean).join(" ");

  return {
    sourcingListingId: listing.id,
    stockReference,
    sourceUrl: listing.sourceUrl,
    source: listing.source,
    brand: listing.brand,
    model: listing.model,
    version: listing.version,
    title,
    year: listing.year,
    mileage: listing.mileage,
    price: expectedSalePrice,
    currency: listing.currency || "EUR",
    fuel: listing.fuel,
    transmission: listing.transmission,
    power: listing.power,
    location: listing.location,
    country: listing.country,
    imageUrl: listing.imageUrl,
    description: listing.analysis?.plannedWorks || listing.analysis?.notes || null,
    status: DealerVehicleStatus.AVAILABLE,
  };
}

export async function publishListingToDealer(listingId: string) {
  const listing = await defaultPrisma.vehicleListing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      analysis: true,
      dealerVehicle: true,
    },
  });

  if (!listing) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Listing not found.",
      } as ApiResponse,
    };
  }

  const expectedSalePrice = listing.analysis?.expectedSalePrice;
  if (!expectedSalePrice || expectedSalePrice <= 0) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Ajoute un prix de revente cible avant de publier sur Dealer.",
      } as ApiResponse,
    };
  }

  const existingDealerVehicle = await defaultPrisma.dealerVehicle.findUnique({
    where: {
      sourcingListingId: listing.id,
    },
  });

  if (existingDealerVehicle?.status === DealerVehicleStatus.AVAILABLE) {
    await defaultPrisma.vehicleListing.update({
      where: { id: listing.id },
      data: { internalStatus: VehicleInternalStatus.PUBLISHED },
    });

    return {
      status: 200,
      body: {
        success: true,
        data: existingDealerVehicle,
      } as ApiResponse,
    };
  }

  const stockReference =
    existingDealerVehicle?.stockReference || (await generateDealerStockReference());
  const data = buildDealerVehicleDataFromListing(listing, stockReference);

  const dealerVehicle = existingDealerVehicle
    ? await defaultPrisma.dealerVehicle.update({
        where: {
          id: existingDealerVehicle.id,
        },
        data,
      })
    : await defaultPrisma.dealerVehicle.create({
        data,
      });

  await defaultPrisma.vehicleListing.update({
    where: { id: listing.id },
    data: { internalStatus: VehicleInternalStatus.PUBLISHED },
  });

  return {
    status: 200,
    body: {
      success: true,
      data: dealerVehicle,
    } as ApiResponse,
  };
}
