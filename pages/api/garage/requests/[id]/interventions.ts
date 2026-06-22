import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import {
  ApiResponse,
  parseNumber,
  parseString,
  recalculateGarageQuoteTotal,
  serializeError,
} from "../../../../../lib/garage";
import { requireDashboardAuth } from "../../../../../lib/simple-auth";

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

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const existingRequest = await prisma.garageRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Garage request not found.",
      });
    }

    const interventionCodeId = parseString(req.body.interventionCodeId);
    const qtyOverride = parseNumber(req.body.qty);
    const unitPriceOverride = parseNumber(req.body.unitPrice);

    if (interventionCodeId) {
      const interventionCode = await prisma.interventionCode.findUnique({
        where: { id: interventionCodeId },
      });

      if (!interventionCode) {
        return res.status(404).json({
          success: false,
          message: "Intervention code not found.",
        });
      }

      const qty = qtyOverride ?? interventionCode.defaultQty;
      const unitPrice = unitPriceOverride ?? interventionCode.unitPrice;

      await prisma.garageInterventionLine.create({
        data: {
          garageRequestId: id,
          interventionCodeId,
          code: interventionCode.code,
          label: interventionCode.label,
          category: interventionCode.category,
          qty,
          unitPrice,
          total: qty * unitPrice,
        },
      });
    } else {
      const label = parseString(req.body.label);
      const unitPrice = unitPriceOverride;

      if (!label || unitPrice === null || unitPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: "label and unitPrice are required for a custom line.",
        });
      }

      const qty = qtyOverride ?? 1;

      await prisma.garageInterventionLine.create({
        data: {
          garageRequestId: id,
          code: parseString(req.body.code) ?? null,
          label,
          category: parseString(req.body.category) ?? null,
          qty,
          unitPrice,
          total: qty * unitPrice,
        },
      });
    }

    const request = await recalculateGarageQuoteTotal(id);

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    console.error("POST /api/garage/requests/[id]/interventions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add intervention line.",
      error: serializeError(error),
    });
  }
}
