import type { NextApiRequest, NextApiResponse } from "next";
import { GarageRequestPriority, GarageRequestStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import {
  ApiResponse,
  parseDate,
  parseNumber,
  parseString,
  parseSymptoms,
  serializeError,
} from "../../../lib/garage";
import { requireDashboardAuth } from "../../../lib/simple-auth";

function normalizeCreateData(body: any) {
  const vehicleYear = parseNumber(body.vehicleYear);
  const mileage = parseNumber(body.mileage);
  const preferredDate = parseDate(body.preferredDate);
  const status =
    typeof body.status === "string" &&
    Object.values(GarageRequestStatus).includes(body.status as GarageRequestStatus)
      ? (body.status as GarageRequestStatus)
      : GarageRequestStatus.NEW;
  const priority =
    typeof body.priority === "string" &&
    Object.values(GarageRequestPriority).includes(
      body.priority as GarageRequestPriority
    )
      ? (body.priority as GarageRequestPriority)
      : GarageRequestPriority.NORMAL;

  return {
    firstName: parseString(body.firstName) ?? null,
    lastName: parseString(body.lastName) ?? null,
    email: parseString(body.email) ?? null,
    phone: parseString(body.phone) ?? null,
    vehicleBrand: parseString(body.vehicleBrand) ?? null,
    vehicleModel: parseString(body.vehicleModel) ?? null,
    vehicleYear: vehicleYear ?? null,
    mileage: mileage ?? null,
    plateNumber: parseString(body.plateNumber) ?? null,
    problemType: parseString(body.problemType) ?? null,
    symptoms: parseSymptoms(body.symptoms),
    description: parseString(body.description) ?? null,
    preferredContactMethod: parseString(body.preferredContactMethod) ?? null,
    preferredDate: preferredDate ?? null,
    status,
    priority,
    source: parseString(body.source) ?? "website",
    quoteNote: parseString(body.quoteNote) ?? null,
    mechanicNotes: parseString(body.mechanicNotes) ?? null,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    const auth = requireDashboardAuth(req, res);
    if (!auth.ok) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    try {
      const archivedOnly = req.query.archived === "true";
      const requests = await prisma.garageRequest.findMany({
        where: archivedOnly ? { archivedAt: { not: null } } : { archivedAt: null },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          interventions: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: requests.map((request) => ({
          ...request,
          summary: {
            interventionCount: request.interventions.length,
            quoteTotal: request.quoteTotal,
          },
        })),
      });
    } catch (error: any) {
      console.error("GET /api/garage/requests error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch garage requests.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const request = await prisma.garageRequest.create({
        data: normalizeCreateData(req.body),
        include: {
          interventions: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error("POST /api/garage/requests error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create garage request.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
