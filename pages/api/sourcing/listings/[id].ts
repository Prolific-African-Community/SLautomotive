import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { VehicleInternalStatus } from "@prisma/client";

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

function parseNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function calculateMargin(input: {
  price?: number | null;
  purchaseTargetPrice?: number | null;
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
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid listing id.",
    });
  }

  if (req.method === "PATCH") {
    try {
      const existing = await prisma.vehicleListing.findUnique({
        where: { id },
        include: { analysis: true, dealerVehicle: true },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found.",
        });
      }

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
        isActive,
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

      const safeStatus =
        typeof internalStatus === "string" &&
        Object.values(VehicleInternalStatus).includes(
          internalStatus as VehicleInternalStatus
        )
          ? (internalStatus as VehicleInternalStatus)
          : undefined;

      const parsedPrice = parseNumber(price);
      const parsedPurchaseTargetPrice = parseNumber(purchaseTargetPrice);
      const parsedNegotiationPrice = parseNumber(negotiationPrice);
      const parsedRepairCostEstimate = parseNumber(repairCostEstimate);
      const parsedTransportCost = parseNumber(transportCost);
      const parsedCustomsCost = parseNumber(customsCost);
      const parsedOtherCosts = parseNumber(otherCosts);
      const parsedExpectedSalePrice = parseNumber(expectedSalePrice);

      const finalPrice =
        parsedPrice !== undefined ? parsedPrice : existing.price;

      const finalPurchaseTargetPrice =
        parsedPurchaseTargetPrice !== undefined
          ? parsedPurchaseTargetPrice
          : existing.analysis?.purchaseTargetPrice ?? null;

      const finalRepairCostEstimate =
        parsedRepairCostEstimate !== undefined
          ? parsedRepairCostEstimate
          : existing.analysis?.repairCostEstimate ?? null;

      const finalTransportCost =
        parsedTransportCost !== undefined
          ? parsedTransportCost
          : existing.analysis?.transportCost ?? null;

      const finalCustomsCost =
        parsedCustomsCost !== undefined
          ? parsedCustomsCost
          : existing.analysis?.customsCost ?? null;

      const finalOtherCosts =
        parsedOtherCosts !== undefined
          ? parsedOtherCosts
          : existing.analysis?.otherCosts ?? null;

      const finalExpectedSalePrice =
        parsedExpectedSalePrice !== undefined
          ? parsedExpectedSalePrice
          : existing.analysis?.expectedSalePrice ?? null;

      const margin = calculateMargin({
        price: finalPrice,
        purchaseTargetPrice: finalPurchaseTargetPrice,
        repairCostEstimate: finalRepairCostEstimate,
        transportCost: finalTransportCost,
        customsCost: finalCustomsCost,
        otherCosts: finalOtherCosts,
        expectedSalePrice: finalExpectedSalePrice,
      });

      const updated = await prisma.vehicleListing.update({
        where: { id },
        data: {
          ...(source !== undefined ? { source } : {}),
          ...(sourceUrl !== undefined ? { sourceUrl } : {}),
          ...(externalId !== undefined ? { externalId } : {}),

          ...(brand !== undefined ? { brand } : {}),
          ...(model !== undefined ? { model } : {}),
          ...(version !== undefined ? { version } : {}),
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),

          ...(parseNumber(year) !== undefined ? { year: parseNumber(year) } : {}),
          ...(parseNumber(mileage) !== undefined
            ? { mileage: parseNumber(mileage) }
            : {}),
          ...(parsedPrice !== undefined ? { price: parsedPrice } : {}),
          ...(currency !== undefined ? { currency } : {}),

          ...(fuel !== undefined ? { fuel } : {}),
          ...(transmission !== undefined ? { transmission } : {}),
          ...(power !== undefined ? { power } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(country !== undefined ? { country } : {}),
          ...(imageUrl !== undefined ? { imageUrl } : {}),

          ...(typeof isActive === "boolean" ? { isActive } : {}),
          ...(safeStatus ? { internalStatus: safeStatus } : {}),

          analysis: {
            upsert: {
              create: {
                purchaseTargetPrice: finalPurchaseTargetPrice,
                negotiationPrice:
                  parsedNegotiationPrice !== undefined
                    ? parsedNegotiationPrice
                    : null,
                repairCostEstimate: finalRepairCostEstimate,
                transportCost: finalTransportCost,
                customsCost: finalCustomsCost,
                otherCosts: finalOtherCosts,
                expectedSalePrice: finalExpectedSalePrice,
                expectedMargin: margin.expectedMargin,
                marginRate: margin.marginRate,
                plannedWorks: plannedWorks ?? null,
                notes: notes ?? null,
                priorityScore:
                  parseNumber(priorityScore) !== undefined
                    ? parseNumber(priorityScore)
                    : null,
                isFavorite: Boolean(isFavorite),
              },
              update: {
                ...(parsedPurchaseTargetPrice !== undefined
                  ? { purchaseTargetPrice: parsedPurchaseTargetPrice }
                  : {}),
                ...(parsedNegotiationPrice !== undefined
                  ? { negotiationPrice: parsedNegotiationPrice }
                  : {}),
                ...(parsedRepairCostEstimate !== undefined
                  ? { repairCostEstimate: parsedRepairCostEstimate }
                  : {}),
                ...(parsedTransportCost !== undefined
                  ? { transportCost: parsedTransportCost }
                  : {}),
                ...(parsedCustomsCost !== undefined
                  ? { customsCost: parsedCustomsCost }
                  : {}),
                ...(parsedOtherCosts !== undefined
                  ? { otherCosts: parsedOtherCosts }
                  : {}),
                ...(parsedExpectedSalePrice !== undefined
                  ? { expectedSalePrice: parsedExpectedSalePrice }
                  : {}),

                expectedMargin: margin.expectedMargin,
                marginRate: margin.marginRate,

                ...(plannedWorks !== undefined ? { plannedWorks } : {}),
                ...(notes !== undefined ? { notes } : {}),
                ...(parseNumber(priorityScore) !== undefined
                  ? { priorityScore: parseNumber(priorityScore) }
                  : {}),
                ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
              },
            },
          },
        },
        include: {
          analysis: true,
          sourcingRule: true,
          dealerVehicle: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error("PATCH /api/sourcing/listings/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update listing.",
        error: {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
        },
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.vehicleListing.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        data: { deleted: true },
      });
    } catch (error: any) {
      console.error("DELETE /api/sourcing/listings/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete listing.",
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
