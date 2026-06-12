import { GarageRequestStatus, PrismaClient } from "@prisma/client";
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

export function parseString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const text = String(value).trim();
  return text ? text : null;
}

export function parseSymptoms(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function recalculateGarageQuoteTotal(
  garageRequestId: string,
  db: PrismaClient = defaultPrisma
) {
  const lines = await db.garageInterventionLine.findMany({
    where: {
      garageRequestId,
    },
    select: {
      total: true,
    },
  });

  const quoteTotal =
    lines.length > 0
      ? lines.reduce((sum, line) => sum + (line.total || 0), 0)
      : null;

  const request = await db.garageRequest.findUnique({
    where: {
      id: garageRequestId,
    },
    select: {
      status: true,
    },
  });

  const shouldMarkQuoteReady =
    lines.length > 0 &&
    request !== null &&
    (request.status === GarageRequestStatus.NEW ||
      request.status === GarageRequestStatus.IN_REVIEW);

  return db.garageRequest.update({
    where: {
      id: garageRequestId,
    },
    data: {
      quoteTotal,
      ...(shouldMarkQuoteReady
        ? {
            status: GarageRequestStatus.QUOTE_READY,
          }
        : {}),
    },
    include: {
      interventions: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}
