import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import {
  ApiResponse,
  parseNumber,
  parseString,
  recalculateGarageQuoteTotal,
  serializeError,
} from "../../../../lib/garage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { lineId } = req.query;

  if (!lineId || typeof lineId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid intervention line id.",
    });
  }

  if (req.method === "PATCH") {
    try {
      const existing = await prisma.garageInterventionLine.findUnique({
        where: { id: lineId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Intervention line not found.",
        });
      }

      const qty = parseNumber(req.body.qty);
      const unitPrice = parseNumber(req.body.unitPrice);
      const nextQty = qty !== undefined && qty !== null ? qty : existing.qty;
      const nextUnitPrice =
        unitPrice !== undefined && unitPrice !== null
          ? unitPrice
          : existing.unitPrice;
      const data: any = {
        qty: nextQty,
        unitPrice: nextUnitPrice,
        total: nextQty * nextUnitPrice,
      };

      ["label", "code", "category"].forEach((field) => {
        const value = parseString(req.body[field]);
        if (value !== undefined) data[field] = value;
      });

      await prisma.garageInterventionLine.update({
        where: { id: lineId },
        data,
      });

      const request = await recalculateGarageQuoteTotal(existing.garageRequestId);

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error("PATCH /api/garage/interventions/[lineId] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update intervention line.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const existing = await prisma.garageInterventionLine.findUnique({
        where: { id: lineId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Intervention line not found.",
        });
      }

      await prisma.garageInterventionLine.delete({
        where: { id: lineId },
      });

      const request = await recalculateGarageQuoteTotal(existing.garageRequestId);

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error("DELETE /api/garage/interventions/[lineId] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete intervention line.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
