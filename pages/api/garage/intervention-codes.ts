import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import {
  ApiResponse,
  parseNumber,
  parseString,
  serializeError,
} from "../../../lib/garage";

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
  if (req.method === "GET") {
    try {
      const activeOnly = req.query.activeOnly === "true";
      const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const codes = await prisma.interventionCode.findMany({
        where: {
          ...(activeOnly ? { isActive: true } : {}),
          ...(category
            ? {
                category: {
                  equals: category,
                  mode: "insensitive",
                },
              }
            : {}),
          ...(search
            ? {
                OR: [
                  { code: { contains: search, mode: "insensitive" } },
                  { label: { contains: search, mode: "insensitive" } },
                  { category: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: [{ category: "asc" }, { code: "asc" }],
      });

      return res.status(200).json({
        success: true,
        data: codes,
      });
    } catch (error: any) {
      console.error("GET /api/garage/intervention-codes error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch intervention codes.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const code = normalizeCode(req.body.code);
      const label = parseString(req.body.label);
      const category = parseString(req.body.category);
      const unitPrice = parseNumber(req.body.unitPrice);
      const defaultQty = parseNumber(req.body.defaultQty);
      const estimatedMinutes = parseInteger(req.body.estimatedMinutes);

      if (!code || !label || !category || unitPrice === null || unitPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: "code, label, category and unitPrice are required.",
        });
      }

      if (unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "unitPrice must be greater than or equal to 0.",
        });
      }

      if (defaultQty !== undefined && defaultQty !== null && defaultQty <= 0) {
        return res.status(400).json({
          success: false,
          message: "defaultQty must be greater than 0.",
        });
      }

      if (
        estimatedMinutes !== undefined &&
        estimatedMinutes !== null &&
        estimatedMinutes < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "estimatedMinutes must be greater than or equal to 0.",
        });
      }

      const existingCode = await prisma.interventionCode.findUnique({
        where: { code },
        select: { id: true },
      });

      if (existingCode) {
        return res.status(409).json({
          success: false,
          message: `Le code ${code} existe déjà.`,
        });
      }

      const interventionCode = await prisma.interventionCode.create({
        data: {
          code,
          label,
          category,
          description: parseString(req.body.description) ?? null,
          unitPrice,
          defaultQty: defaultQty ?? 1,
          estimatedMinutes: estimatedMinutes ?? null,
          isActive:
            typeof req.body.isActive === "boolean" ? req.body.isActive : true,
        },
      });

      return res.status(201).json({
        success: true,
        data: interventionCode,
      });
    } catch (error: any) {
      console.error("POST /api/garage/intervention-codes error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create intervention code.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
