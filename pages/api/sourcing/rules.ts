import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { requireDashboardAuth } from "../../../lib/simple-auth";

type ApiResponse =
  | {
      success: true;
      data: any;
    }
  | {
      success: false;
      message: string;
      error?: any;
    };

function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return [];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  if (req.method === "GET") {
    try {
      const rules = await prisma.sourcingRule.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              listings: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error: any) {
      console.error("GET /api/sourcing/rules error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch sourcing rules.",
        error: {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
        },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        brand,
        model,
        yearMin,
        yearMax,
        priceMax,
        mileageMax,
        countries,
        sources,
        isActive,
      } = req.body;

      if (!brand || typeof brand !== "string") {
        return res.status(400).json({
          success: false,
          message: "brand is required.",
        });
      }

      if (!model || typeof model !== "string") {
        return res.status(400).json({
          success: false,
          message: "model is required.",
        });
      }

      const rule = await prisma.sourcingRule.create({
        data: {
          brand: brand.trim(),
          model: model.trim(),

          yearMin: parseNumber(yearMin),
          yearMax: parseNumber(yearMax),
          priceMax: parseNumber(priceMax),
          mileageMax: parseNumber(mileageMax),

          countries: parseStringArray(countries),
          sources: parseStringArray(sources),

          isActive: typeof isActive === "boolean" ? isActive : true,
        },
      });

      return res.status(201).json({
        success: true,
        data: rule,
      });
    } catch (error: any) {
      console.error("POST /api/sourcing/rules error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create sourcing rule.",
        error: {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
        },
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
