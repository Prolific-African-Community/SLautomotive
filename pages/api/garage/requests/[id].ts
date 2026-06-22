import type { NextApiRequest, NextApiResponse } from "next";
import { GarageRequestPriority, GarageRequestStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import {
  ApiResponse,
  parseDate,
  parseNumber,
  parseString,
  parseSymptoms,
  serializeError,
} from "../../../../lib/garage";
import { requireDashboardAuth } from "../../../../lib/simple-auth";

function buildPatchData(body: any) {
  const data: any = {};

  const stringFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "vehicleBrand",
    "vehicleModel",
    "plateNumber",
    "problemType",
    "description",
    "preferredContactMethod",
    "quoteNote",
    "mechanicNotes",
  ];

  stringFields.forEach((field) => {
    const value = parseString(body[field]);
    if (value !== undefined) data[field] = value;
  });

  const vehicleYear = parseNumber(body.vehicleYear);
  if (vehicleYear !== undefined) data.vehicleYear = vehicleYear;

  const mileage = parseNumber(body.mileage);
  if (mileage !== undefined) data.mileage = mileage;

  const preferredDate = parseDate(body.preferredDate);
  if (preferredDate !== undefined) data.preferredDate = preferredDate;

  if (body.symptoms !== undefined) {
    data.symptoms = parseSymptoms(body.symptoms);
  }

  if (
    typeof body.status === "string" &&
    Object.values(GarageRequestStatus).includes(body.status as GarageRequestStatus)
  ) {
    data.status = body.status as GarageRequestStatus;
  }

  if (
    typeof body.priority === "string" &&
    Object.values(GarageRequestPriority).includes(
      body.priority as GarageRequestPriority
    )
  ) {
    data.priority = body.priority as GarageRequestPriority;
  }

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
      message: "Invalid garage request id.",
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
      const request = await prisma.garageRequest.findUnique({
        where: { id },
        include: {
          interventions: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Garage request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error("GET /api/garage/requests/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch garage request.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      const action = typeof req.body?.action === "string" ? req.body.action : null;
      const patchData =
        action === "archive"
          ? { archivedAt: new Date() }
          : action === "unarchive"
          ? { archivedAt: null }
          : buildPatchData(req.body);

      const request = await prisma.garageRequest.update({
        where: { id },
        data: patchData,
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
        data: request,
      });
    } catch (error: any) {
      console.error("PATCH /api/garage/requests/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update garage request.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.garageRequest.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        data: {
          deletedRequestId: id,
        },
      });
    } catch (error: any) {
      console.error("DELETE /api/garage/requests/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete garage request.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
