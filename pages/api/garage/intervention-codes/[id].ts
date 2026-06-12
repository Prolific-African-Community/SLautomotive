import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import {
  ApiResponse,
  parseNumber,
  parseString,
  serializeError,
} from "../../../../lib/garage";

function normalizeCode(value: unknown) {
  const text = parseString(value);
  return text ? text.toUpperCase() : text;
}

function parseInteger(value: unknown): number | null | undefined {
  const parsed = parseNumber(value);
  if (parsed === undefined || parsed === null) return parsed;
  return Math.trunc(parsed);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid intervention code id.",
    });
  }

  if (req.method === "PATCH") {
    try {
      const data: any = {};
      const stringFields = ["label", "category", "description"];

      stringFields.forEach((field) => {
        const value = parseString(req.body[field]);
        if (value !== undefined) data[field] = value;
      });

      const code = normalizeCode(req.body.code);
      if (code !== undefined) {
        if (!code) {
          return res.status(400).json({
            success: false,
            message: "code cannot be empty.",
          });
        }

        const existingCode = await prisma.interventionCode.findUnique({
          where: { code },
          select: { id: true },
        });

        if (existingCode && existingCode.id !== id) {
          return res.status(409).json({
            success: false,
            message: `Le code ${code} existe déjà.`,
          });
        }

        data.code = code;
      }

      const unitPrice = parseNumber(req.body.unitPrice);
      if (unitPrice !== undefined) {
        if (unitPrice === null || unitPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "unitPrice must be greater than or equal to 0.",
          });
        }

        data.unitPrice = unitPrice;
      }

      const defaultQty = parseNumber(req.body.defaultQty);
      if (defaultQty !== undefined) {
        if (defaultQty === null || defaultQty <= 0) {
          return res.status(400).json({
            success: false,
            message: "defaultQty must be greater than 0.",
          });
        }

        data.defaultQty = defaultQty;
      }

      const estimatedMinutes = parseInteger(req.body.estimatedMinutes);
      if (estimatedMinutes !== undefined) {
        if (estimatedMinutes !== null && estimatedMinutes < 0) {
          return res.status(400).json({
            success: false,
            message: "estimatedMinutes must be greater than or equal to 0.",
          });
        }

        data.estimatedMinutes = estimatedMinutes;
      }

      if (typeof req.body.isActive === "boolean") {
        data.isActive = req.body.isActive;
      }

      const interventionCode = await prisma.interventionCode.update({
        where: { id },
        data,
      });

      return res.status(200).json({
        success: true,
        data: interventionCode,
      });
    } catch (error: any) {
      console.error("PATCH /api/garage/intervention-codes/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update intervention code.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const interventionCode = await prisma.interventionCode.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return res.status(200).json({
        success: true,
        data: interventionCode,
      });
    } catch (error: any) {
      console.error("DELETE /api/garage/intervention-codes/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete intervention code.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
