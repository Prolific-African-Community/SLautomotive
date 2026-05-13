import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { VehicleInternalStatus } from "@prisma/client";

type ApiResponse =
  | {
      success: true;
      data: any;
    }
  | {
      success: false;
      message: string;
      error?: unknown;
    };

function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function calculateMargin(input: {
  purchaseTargetPrice?: number | null;
  price?: number | null;
  repairCostEstimate?: number | null;
  transportCost?: number | null;
  customsCost?: number | null;
  otherCosts?: number | null;
  expectedSalePrice?: number | null;
}) {
  const purchasePrice = input.purchaseTargetPrice ?? input.price ?? 0;
  const repairCost = input.repairCostEstimate ?? 0;
  const transportCost = input.transportCost ?? 0;
  const customsCost = input.customsCost ?? 0;
  const otherCosts = input.otherCosts ?? 0;
  const expectedSalePrice = input.expectedSalePrice ?? 0;

  const totalCost =
    purchasePrice + repairCost + transportCost + customsCost + otherCosts;

  const expectedMargin =
    expectedSalePrice > 0 && totalCost > 0
      ? expectedSalePrice - totalCost
      : null;

  const marginRate =
    expectedMargin !== null && totalCost > 0
      ? (expectedMargin / totalCost) * 100
      : null;

  return {
    expectedMargin,
    marginRate,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    try {
      const {
        brand,
        model,
        status,
        source,
        active,
        favorite,
        search,
      } = req.query;

      const listings = await prisma.vehicleListing.findMany({
        where: {
          ...(typeof brand === "string" && brand.trim()
            ? {
                brand: {
                  contains: brand.trim(),
                  mode: "insensitive",
                },
              }
            : {}),

          ...(typeof model === "string" && model.trim()
            ? {
                model: {
                  contains: model.trim(),
                  mode: "insensitive",
                },
              }
            : {}),

          ...(typeof source === "string" && source.trim()
            ? {
                source: {
                  contains: source.trim(),
                  mode: "insensitive",
                },
              }
            : {}),

          ...(typeof status === "string" &&
          Object.values(VehicleInternalStatus).includes(
            status as VehicleInternalStatus
          )
            ? {
                internalStatus: status as VehicleInternalStatus,
              }
            : {}),

          ...(active === "true"
            ? { isActive: true }
            : active === "false"
            ? { isActive: false }
            : {}),

          ...(favorite === "true"
            ? {
                analysis: {
                  isFavorite: true,
                },
              }
            : {}),

          ...(typeof search === "string" && search.trim()
            ? {
                OR: [
                  {
                    title: {
                      contains: search.trim(),
                      mode: "insensitive",
                    },
                  },
                  {
                    brand: {
                      contains: search.trim(),
                      mode: "insensitive",
                    },
                  },
                  {
                    model: {
                      contains: search.trim(),
                      mode: "insensitive",
                    },
                  },
                  {
                    sourceUrl: {
                      contains: search.trim(),
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          analysis: true,
          sourcingRule: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        data: listings,
      });
    } catch (error: any) {
  console.error("GET /api/sourcing/listings error:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to fetch sourcing listings.",
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
        source,
        sourceUrl,
        externalId,

        brand,
        model,
        version,
        title,
        description,

        year,
        mileage,
        price,
        currency,

        fuel,
        transmission,
        power,
        location,
        country,
        imageUrl,

        internalStatus,

        purchaseTargetPrice,
        negotiationPrice,
        repairCostEstimate,
        transportCost,
        customsCost,
        otherCosts,
        expectedSalePrice,
        plannedWorks,
        notes,
        priorityScore,
        isFavorite,
      } = req.body;

      if (!source || typeof source !== "string") {
        return res.status(400).json({
          success: false,
          message: "source is required.",
        });
      }

      if (!sourceUrl || typeof sourceUrl !== "string") {
        return res.status(400).json({
          success: false,
          message: "sourceUrl is required.",
        });
      }

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

      const parsedPrice = parseNumber(price);
      const parsedPurchaseTargetPrice = parseNumber(purchaseTargetPrice);
      const parsedNegotiationPrice = parseNumber(negotiationPrice);
      const parsedRepairCostEstimate = parseNumber(repairCostEstimate);
      const parsedTransportCost = parseNumber(transportCost);
      const parsedCustomsCost = parseNumber(customsCost);
      const parsedOtherCosts = parseNumber(otherCosts);
      const parsedExpectedSalePrice = parseNumber(expectedSalePrice);

      const margin = calculateMargin({
        price: parsedPrice,
        purchaseTargetPrice: parsedPurchaseTargetPrice,
        repairCostEstimate: parsedRepairCostEstimate,
        transportCost: parsedTransportCost,
        customsCost: parsedCustomsCost,
        otherCosts: parsedOtherCosts,
        expectedSalePrice: parsedExpectedSalePrice,
      });

      const safeStatus =
        typeof internalStatus === "string" &&
        Object.values(VehicleInternalStatus).includes(
          internalStatus as VehicleInternalStatus
        )
          ? (internalStatus as VehicleInternalStatus)
          : VehicleInternalStatus.NEW;

      const listing = await prisma.vehicleListing.create({
        data: {
          source: source.trim(),
          sourceUrl: sourceUrl.trim(),
          externalId: externalId || null,

          brand: brand.trim(),
          model: model.trim(),
          version: version || null,
          title: title || `${brand} ${model}`,
          description: description || null,

          year: parseNumber(year),
          mileage: parseNumber(mileage),
          price: parsedPrice,
          currency: currency || "EUR",

          fuel: fuel || null,
          transmission: transmission || null,
          power: power || null,
          location: location || null,
          country: country || null,
          imageUrl: imageUrl || null,

          internalStatus: safeStatus,

          analysis: {
            create: {
              purchaseTargetPrice: parsedPurchaseTargetPrice,
              negotiationPrice: parsedNegotiationPrice,

              repairCostEstimate: parsedRepairCostEstimate,
              transportCost: parsedTransportCost,
              customsCost: parsedCustomsCost,
              otherCosts: parsedOtherCosts,

              expectedSalePrice: parsedExpectedSalePrice,
              expectedMargin: margin.expectedMargin,
              marginRate: margin.marginRate,

              plannedWorks: plannedWorks || null,
              notes: notes || null,

              priorityScore: parseNumber(priorityScore),
              isFavorite: Boolean(isFavorite),
            },
          },
        },
        include: {
          analysis: true,
          sourcingRule: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: listing,
      });
    } catch (error: any) {
      console.error("POST /api/sourcing/listings error:", error);

      if (error?.code === "P2002") {
        return res.status(409).json({
          success: false,
          message: "This listing already exists. sourceUrl must be unique.",
          error,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create sourcing listing.",
        error,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}