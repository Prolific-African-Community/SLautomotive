import type { NextApiRequest, NextApiResponse } from "next";
import { DealerVehicleStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import {
  ApiResponse,
  generateDealerStockReference,
  parseBoolean,
  parseNumber,
  parseString,
  serializeError,
} from "../../../lib/dealer";

function safeStatus(value: unknown) {
  return typeof value === "string" &&
    Object.values(DealerVehicleStatus).includes(value as DealerVehicleStatus)
    ? (value as DealerVehicleStatus)
    : undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    try {
      const includeHidden = req.query.includeHidden === "true";
      const status = safeStatus(req.query.status);

      const vehicles = await prisma.dealerVehicle.findMany({
        where: {
          ...(status
            ? { status }
            : includeHidden
            ? {}
            : { status: DealerVehicleStatus.AVAILABLE }),
        },
        include: {
          sourcingListing: true,
        },
        orderBy: [
          { isFeatured: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      });

      return res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error: any) {
      console.error("GET /api/dealer/vehicles error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dealer vehicles.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const brand = parseString(req.body.brand);
      const model = parseString(req.body.model);

      if (!brand || !model) {
        return res.status(400).json({
          success: false,
          message: "brand and model are required.",
        });
      }

      const stockReference =
        parseString(req.body.stockReference) || (await generateDealerStockReference());
      const status = safeStatus(req.body.status) || DealerVehicleStatus.AVAILABLE;

      const vehicle = await prisma.dealerVehicle.create({
        data: {
          stockReference,
          sourceUrl: parseString(req.body.sourceUrl) ?? null,
          source: parseString(req.body.source) ?? null,
          brand,
          model,
          version: parseString(req.body.version) ?? null,
          title: parseString(req.body.title) ?? null,
          year: parseNumber(req.body.year) ?? null,
          mileage: parseNumber(req.body.mileage) ?? null,
          price: parseNumber(req.body.price) ?? null,
          currency: parseString(req.body.currency) ?? "EUR",
          fuel: parseString(req.body.fuel) ?? null,
          transmission: parseString(req.body.transmission) ?? null,
          power: parseString(req.body.power) ?? null,
          location: parseString(req.body.location) ?? null,
          country: parseString(req.body.country) ?? null,
          imageUrl: parseString(req.body.imageUrl) ?? null,
          description: parseString(req.body.description) ?? null,
          dealerNotes: parseString(req.body.dealerNotes) ?? null,
          status,
          isFeatured: parseBoolean(req.body.isFeatured) ?? false,
          sortOrder: parseNumber(req.body.sortOrder) ?? null,
        },
      });

      return res.status(201).json({
        success: true,
        data: vehicle,
      });
    } catch (error: any) {
      console.error("POST /api/dealer/vehicles error:", error);
      return res.status(error?.code === "P2002" ? 409 : 500).json({
        success: false,
        message:
          error?.code === "P2002"
            ? "Cette référence stock existe déjà."
            : "Failed to create dealer vehicle.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
