import type { NextApiRequest, NextApiResponse } from "next";
import { DealerVehicleStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import {
  ApiResponse,
  parseBoolean,
  parseNumber,
  parseString,
  serializeError,
} from "../../../../lib/dealer";
import { requireDashboardAuth } from "../../../../lib/simple-auth";

function safeStatus(value: unknown) {
  return typeof value === "string" &&
    Object.values(DealerVehicleStatus).includes(value as DealerVehicleStatus)
    ? (value as DealerVehicleStatus)
    : undefined;
}

function buildPatchData(body: any) {
  const data: any = {};
  const stringFields = [
    "stockReference",
    "sourceUrl",
    "source",
    "brand",
    "model",
    "version",
    "title",
    "currency",
    "fuel",
    "transmission",
    "power",
    "location",
    "country",
    "imageUrl",
    "description",
    "dealerNotes",
  ];

  stringFields.forEach((field) => {
    const value = parseString(body[field]);
    if (value !== undefined) data[field] = value;
  });

  ["year", "mileage", "price", "sortOrder"].forEach((field) => {
    const value = parseNumber(body[field]);
    if (value !== undefined) data[field] = value;
  });

  const status = safeStatus(body.status);
  if (status) data.status = status;

  const isFeatured = parseBoolean(body.isFeatured);
  if (isFeatured !== undefined) data.isFeatured = isFeatured;

  return data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid dealer vehicle id.",
    });
  }

  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  if (req.method === "GET") {
    try {
      const vehicle = await prisma.dealerVehicle.findUnique({
        where: { id },
        include: { sourcingListing: true },
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Dealer vehicle not found.",
        });
      }

      return res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      console.error("GET /api/dealer/vehicles/[id] error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dealer vehicle.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      const vehicle = await prisma.dealerVehicle.update({
        where: { id },
        data: buildPatchData(req.body),
      });

      return res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      console.error("PATCH /api/dealer/vehicles/[id] error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update dealer vehicle.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const vehicle = await prisma.dealerVehicle.update({
        where: { id },
        data: {
          status: DealerVehicleStatus.HIDDEN,
        },
      });

      return res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      console.error("DELETE /api/dealer/vehicles/[id] error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to hide dealer vehicle.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
